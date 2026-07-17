"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchImageManifestApi,
  fetchEncryptedTileApi,
  type ImageManifest,
  type ImageSessionResponse,
} from "@/apis/file/image-stream-api";

type TileCacheEntry = {
  bitmap: ImageBitmap;
  lastUsed: number;
};

const MAX_CACHED_TILES = 128;
const MAX_CONCURRENT_FETCHES = 6;
const MAX_TILE_ATTEMPTS = 3;

function buildTileUrl(
  template: string,
  level: number,
  x: number,
  y: number,
) {
  return template
    .replace("{level}", String(level))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

function pickLevel(
  manifest: ImageManifest,
  scale: number,
): ImageManifest["levels"][number] {
  const targetW = manifest.width * scale;
  let best = manifest.levels[0];
  let bestDiff = Infinity;
  for (const level of manifest.levels) {
    const diff = Math.abs(level.width - targetW);
    if (diff < bestDiff) {
      best = level;
      bestDiff = diff;
    }
  }
  return best;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

/** Payload layout: IV (16 bytes) + AES-128-CBC ciphertext. */
async function decryptTilePayload(
  payload: ArrayBuffer,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  const iv = payload.slice(0, 16);
  const ciphertext = payload.slice(16);
  return window.crypto.subtle.decrypt(
    { name: "AES-CBC", iv: new Uint8Array(iv) },
    key,
    ciphertext,
  );
}

export function SecureTileViewer({
  session,
  title,
}: {
  session: ImageSessionResponse;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [manifest, setManifest] = useState<ImageManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tileError, setTileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const needsFitRef = useRef(true);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const tileCacheRef = useRef<Map<string, TileCacheEntry>>(new Map());
  const inflightRef = useRef<Set<string>>(new Set());
  const attemptsRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef<number | null>(null);
  const manifestRef = useRef<ImageManifest | null>(null);
  const scheduleDrawRef = useRef<() => void>(() => undefined);
  const tileCryptoKeyRef = useRef<CryptoKey | null>(null);
  const tileFormatRef = useRef<string>(session.tileFormat || "image/webp");

  useEffect(() => {
    manifestRef.current = manifest;
  }, [manifest]);

  // Import the ephemeral session key for client-side tile decryption.
  useEffect(() => {
    let cancelled = false;
    tileCryptoKeyRef.current = null;
    tileFormatRef.current = session.tileFormat || "image/webp";

    if (!session.tileKey) {
      setError("Viewing session did not include a decryption key");
      return;
    }

    window.crypto.subtle
      .importKey("raw", base64ToBytes(session.tileKey), "AES-CBC", false, [
        "decrypt",
      ])
      .then((key) => {
        if (cancelled) return;
        tileCryptoKeyRef.current = key;
        scheduleDrawRef.current();
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to initialize tile decryption in this browser");
        }
      });

    return () => {
      cancelled = true;
      tileCryptoKeyRef.current = null;
    };
  }, [session.tileKey, session.tileFormat]);

  const trimCache = () => {
    const cache = tileCacheRef.current;
    if (cache.size <= MAX_CACHED_TILES) return;
    const sorted = [...cache.entries()].sort(
      (a, b) => a[1].lastUsed - b[1].lastUsed,
    );
    const removeCount = cache.size - MAX_CACHED_TILES;
    for (let i = 0; i < removeCount; i++) {
      const [key, entry] = sorted[i];
      entry.bitmap.close();
      cache.delete(key);
    }
  };

  const fitToScreen = (m: ImageManifest, cssW: number, cssH: number) => {
    const fit = Math.min(cssW / m.width, cssH / m.height, 1);
    scaleRef.current = Math.max(fit * 0.95, 0.01);
    offsetRef.current = {
      x: (cssW - m.width * scaleRef.current) / 2,
      y: (cssH - m.height * scaleRef.current) / 2,
    };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const m = manifestRef.current;
    if (!canvas || !container || !m) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = container.clientWidth;
    const cssH = container.clientHeight;
    // Layout not ready yet — ResizeObserver will redraw once sized.
    if (cssW < 1 || cssH < 1) return;

    if (
      needsFitRef.current ||
      !Number.isFinite(scaleRef.current) ||
      scaleRef.current <= 0
    ) {
      fitToScreen(m, cssW, cssH);
      needsFitRef.current = false;
    }

    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "#0f0f12";
    ctx.fillRect(0, 0, cssW, cssH);

    const scale = scaleRef.current;
    const offset = offsetRef.current;
    const level = pickLevel(m, scale);
    const levelScale = m.width / level.width;
    const tileSize = m.tileSize;

    const viewLeft = -offset.x / scale;
    const viewTop = -offset.y / scale;
    const viewRight = viewLeft + cssW / scale;
    const viewBottom = viewTop + cssH / scale;

    const col0 = Math.max(0, Math.floor(viewLeft / levelScale / tileSize));
    const row0 = Math.max(0, Math.floor(viewTop / levelScale / tileSize));
    const col1 = Math.min(
      level.cols - 1,
      Math.ceil(viewRight / levelScale / tileSize),
    );
    const row1 = Math.min(
      level.rows - 1,
      Math.ceil(viewBottom / levelScale / tileSize),
    );

    const now = Date.now();
    const toFetch: Array<{ key: string; url: string }> = [];
    let visibleCount = 0;
    let failedCount = 0;

    const unit = tileSize * levelScale * scale;

    for (let y = row0; y <= row1; y++) {
      for (let x = col0; x <= col1; x++) {
        visibleCount += 1;
        const key = `${level.level}/${x}/${y}`;
        const cached = tileCacheRef.current.get(key);
        if (cached) {
          cached.lastUsed = now;
          // Snap tile rects to integer pixels with >=1px overlap so lossy
          // tile edges + fractional positions can't produce hairline seams.
          const exactX0 = offset.x + x * unit;
          const exactY0 = offset.y + y * unit;
          const exactX1 =
            offset.x + (x * tileSize + cached.bitmap.width) * levelScale * scale;
          const exactY1 =
            offset.y + (y * tileSize + cached.bitmap.height) * levelScale * scale;
          const dx = Math.floor(exactX0);
          const dy = Math.floor(exactY0);
          const dw = Math.ceil(exactX1) - dx;
          const dh = Math.ceil(exactY1) - dy;
          ctx.drawImage(cached.bitmap, dx, dy, dw, dh);
        } else if ((attemptsRef.current.get(key) ?? 0) >= MAX_TILE_ATTEMPTS) {
          failedCount += 1;
        } else if (!inflightRef.current.has(key)) {
          toFetch.push({
            key,
            url: buildTileUrl(session.tileUrlTemplate, level.level, x, y),
          });
        }
      }
    }

    if (
      visibleCount > 0 &&
      failedCount === visibleCount &&
      inflightRef.current.size === 0
    ) {
      setTileError(
        "Tiles failed to load. The session may have expired — go back and reopen the file.",
      );
    }

    // No visible overlay: an invisible forensic watermark is embedded
    // server-side into every tile for this session.

    // Wait for the decryption key before requesting any tiles.
    const cryptoKey = tileCryptoKeyRef.current;
    if (!cryptoKey) return;

    const slots = Math.max(
      0,
      MAX_CONCURRENT_FETCHES - inflightRef.current.size,
    );
    for (const item of toFetch.slice(0, slots)) {
      inflightRef.current.add(item.key);
      attemptsRef.current.set(
        item.key,
        (attemptsRef.current.get(item.key) ?? 0) + 1,
      );
      void fetchEncryptedTileApi(item.url)
        .then(async (payload) => {
          const plain = await decryptTilePayload(payload, cryptoKey);
          const bitmap = await createImageBitmap(
            new Blob([plain], { type: tileFormatRef.current }),
          );
          tileCacheRef.current.set(item.key, { bitmap, lastUsed: Date.now() });
          attemptsRef.current.delete(item.key);
          setTileError(null);
          trimCache();
          scheduleDrawRef.current();
        })
        .catch((err: any) => {
          const status = err?.response?.status;
          // Hard failures: stop retrying immediately.
          if (status === 404 || status === 403 || status === 401) {
            attemptsRef.current.set(item.key, MAX_TILE_ATTEMPTS);
          }
          console.warn(
            `[tile] ${item.key} failed${status ? ` (${status})` : ""}`,
            err?.message,
          );
          scheduleDrawRef.current();
        })
        .finally(() => {
          inflightRef.current.delete(item.key);
        });
    }
  }, [session.tileUrlTemplate]);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }, [draw]);

  useEffect(() => {
    scheduleDrawRef.current = scheduleDraw;
  }, [scheduleDraw]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTileError(null);
    attemptsRef.current.clear();
    needsFitRef.current = true;

    fetchImageManifestApi(session.manifestUrl)
      .then((m) => {
        if (cancelled) return;
        setManifest(m);
        manifestRef.current = m;
        setLoading(false);
        scheduleDraw();
      })
      .catch((err: any) => {
        if (cancelled) return;
        setLoading(false);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load image manifest",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [session.manifestUrl, scheduleDraw]);

  // Redraw when the container gets its real size (fixes zero-size mount).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => scheduleDraw());
    observer.observe(container);

    const onResize = () => scheduleDraw();
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [scheduleDraw]);

  // Non-passive wheel so preventDefault works (React onWheel is passive).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !manifestRef.current) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const prev = scaleRef.current;
      if (!Number.isFinite(prev) || prev <= 0) return;
      const next = Math.min(
        8,
        Math.max(0.05, prev * (e.deltaY > 0 ? 0.9 : 1.1)),
      );
      const ox = offsetRef.current.x;
      const oy = offsetRef.current.y;
      offsetRef.current = {
        x: mx - ((mx - ox) * next) / prev,
        y: my - ((my - oy) * next) / prev,
      };
      scaleRef.current = next;
      scheduleDraw();
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [scheduleDraw]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        // Must reset: StrictMode remounts preserve refs, and a stale id here
        // permanently blocks scheduleDraw's "already scheduled" gate.
        rafRef.current = null;
      }
      for (const entry of tileCacheRef.current.values()) {
        entry.bitmap.close();
      }
      tileCacheRef.current.clear();
      inflightRef.current.clear();
      attemptsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    scheduleDraw();
  }, [manifest, scheduleDraw]);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    offsetRef.current = {
      x: offsetRef.current.x + dx,
      y: offsetRef.current.y + dy,
    };
    scheduleDraw();
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onDoubleClick = () => {
    needsFitRef.current = true;
    scheduleDraw();
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden rounded-lg bg-black"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground">
          Loading secure tiles…
        </div>
      )}
      {(error || tileError) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center text-sm text-destructive">
          {error || tileError}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        aria-label={title}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      />
      <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-[10px] text-white/80">
        Encrypted tile stream · double-click to fit · session expires{" "}
        {new Date(session.expiresAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
