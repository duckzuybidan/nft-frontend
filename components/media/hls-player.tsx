"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2 } from "lucide-react";

interface HlsPlayerProps {
  manifestUrl: string;
  isAudio?: boolean;
  title?: string;
}

export function HlsPlayer({
  manifestUrl,
  isAudio = false,
  title = "Media",
}: HlsPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    setError(null);
    setIsLoading(true);

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        void media.play().catch(() => undefined);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError("Playback failed. Your session may have expired.");
          setIsLoading(false);
        }
      });

      hls.loadSource(manifestUrl);
      hls.attachMedia(media);

      return cleanup;
    }

    if (media.canPlayType("application/vnd.apple.mpegurl")) {
      media.src = manifestUrl;
      media.addEventListener("loadedmetadata", () => setIsLoading(false));
      media.addEventListener("error", () =>
        setError("Playback failed on this browser."),
      );
      return undefined;
    }

    setError("HLS playback is not supported in this browser.");
    setIsLoading(false);
    return undefined;
  }, [manifestUrl]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error ? (
        <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <video
          ref={mediaRef}
          controls
          playsInline
          className={
            isAudio
              ? "w-full max-w-xl"
              : "max-h-full max-w-full rounded-lg bg-black"
          }
          aria-label={title}
        />
      )}
    </div>
  );
}
