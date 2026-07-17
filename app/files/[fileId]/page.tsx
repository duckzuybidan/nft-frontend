"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useFileViewer,
  useStreamStatus,
  useImageTileStatus,
} from "@/hooks/file-hook";
import { useQueryClient } from "@tanstack/react-query";
import { HlsPlayer } from "@/components/media/hls-player";
import { SecureTileViewer } from "@/components/media/secure-tile-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { FILE_VIEWER_PAGE } from "@/lib/var";
import type { StreamSessionResponse } from "@/apis/file/stream-api";
import type { ImageSessionResponse } from "@/apis/file/image-stream-api";

const getStoredPage = (fileId: string): number => {
  const stored = localStorage.getItem(`${FILE_VIEWER_PAGE}_${fileId}`);
  const parsed = Number.parseInt(stored ?? "1", 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
};

const saveStoredPage = (fileId: string, page: number) => {
  localStorage.setItem(`${FILE_VIEWER_PAGE}_${fileId}`, String(page));
};

const isStreamableMimeType = (mimeType: string | null) =>
  Boolean(
    mimeType &&
      (mimeType.startsWith("video/") || mimeType.startsWith("audio/")),
  );

const isImageMimeType = (mimeType: string | null) =>
  Boolean(mimeType?.startsWith("image/"));

const isPdfMimeType = (mimeType: string | null, fileName?: string | null) =>
  mimeType === "application/pdf" ||
  Boolean(fileName?.toLowerCase().endsWith(".pdf"));

/** Images + PDFs use encrypted tile streaming. */
const isTileableMimeType = (
  mimeType: string | null,
  fileName?: string | null,
) => isImageMimeType(mimeType) || isPdfMimeType(mimeType, fileName);

export default function FileViewerPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params?.fileId as string;
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(1);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("File Viewer");
  const [pageText, setPageText] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamSession, setStreamSession] =
    useState<StreamSessionResponse | null>(null);
  const [imageSession, setImageSession] = useState<ImageSessionResponse | null>(
    null,
  );
  const latestBlobUrlRef = useRef<string | null>(null);
  const {
    openFilePage,
    isLoadingPage,
    createStreamSession,
    isCreatingStreamSession,
    reprocessStream,
    isReprocessingStream,
    createImageSession,
    isCreatingImageSession,
    reprocessImageTiles,
    isReprocessingImageTiles,
  } = useFileViewer();
  const queryClient = useQueryClient();

  const isStreamable = isStreamableMimeType(mimeType);
  const isTileable = isTileableMimeType(mimeType, title);
  const isPdf = isPdfMimeType(mimeType, title);

  const { data: streamStatus, isLoading: isLoadingStreamStatus } =
    useStreamStatus(fileId, isStreamable);
  const { data: imageStatus, isLoading: isLoadingImageStatus } =
    useImageTileStatus(fileId, isTileable);

  useEffect(() => {
    if (!fileId) return;
    const storedMeta = window.sessionStorage.getItem(`file-meta-${fileId}`);
    if (storedMeta) {
      const parsed = JSON.parse(storedMeta) as {
        fileName?: string;
        mimeType?: string;
      };
      setTitle(parsed.fileName || "File Viewer");
      setMimeType(parsed.mimeType || null);
    }
  }, [fileId]);

  useEffect(() => {
    if (!fileId || !mimeType) return;

    if (isStreamableMimeType(mimeType) || isTileableMimeType(mimeType, title)) {
      return;
    }

    loadPage(getStoredPage(fileId));
    return () => {
      if (latestBlobUrlRef.current) {
        window.URL.revokeObjectURL(latestBlobUrlRef.current);
      }
    };
  }, [fileId, mimeType, title]);

  useEffect(() => {
    if (!fileId || !isStreamable) return;
    if (streamStatus?.status !== "ready") return;

    let cancelled = false;

    const startPlayback = async () => {
      setError(null);
      try {
        const session = await createStreamSession(fileId);
        if (!cancelled) setStreamSession(session);
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to start streaming playback.",
          );
        }
      }
    };

    void startPlayback();
    return () => {
      cancelled = true;
    };
  }, [fileId, isStreamable, streamStatus?.status]);

  // Tile session for images (page ignored) and PDF pages
  useEffect(() => {
    if (!fileId || !isTileable) return;
    if (imageStatus?.status !== "ready") return;

    const targetPage = isPdf ? page : undefined;
    let cancelled = false;

    const startTileSession = async () => {
      setError(null);
      setImageSession(null);
      try {
        const session = await createImageSession({
          fileId,
          page: targetPage,
        });
        if (!cancelled) {
          setImageSession(session);
          if (session.totalPages) {
            setTotalPages(session.totalPages);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to start secure viewing session.",
          );
        }
      }
    };

    void startTileSession();
    return () => {
      cancelled = true;
    };
  }, [fileId, isTileable, isPdf, page, imageStatus?.status]);

  useEffect(() => {
    if (imageStatus?.totalPages && imageStatus.totalPages > 0) {
      setTotalPages(imageStatus.totalPages);
    }
  }, [imageStatus?.totalPages]);

  useEffect(() => {
    if (!fileId || !isPdf) return;
    const stored = getStoredPage(fileId);
    setPage(stored);
    setPageInput(String(stored));
  }, [fileId, isPdf]);

  const loadPage = async (pageNumber: number) => {
    if (!fileId) return;

    const targetPage = Math.max(1, pageNumber);
    setPage(targetPage);
    setPageInput(String(targetPage));
    setError(null);
    setPageText(null);

    if (latestBlobUrlRef.current) {
      window.URL.revokeObjectURL(latestBlobUrlRef.current);
      latestBlobUrlRef.current = null;
      setPageUrl(null);
    }

    // PDF / image: page change is handled by tile-session effect above
    if (isTileable) {
      saveStoredPage(fileId, targetPage);
      return;
    }

    try {
      const { blob, totalPages: total, currentPage } = await openFilePage({
        fileId,
        page: targetPage,
      });
      setTotalPages(total);
      setPage(currentPage);
      setPageInput(String(currentPage));
      saveStoredPage(fileId, currentPage);

      const shouldRenderText =
        blob.type.startsWith("text/") ||
        blob.type === "application/json" ||
        mimeType === "application/json";

      if (shouldRenderText) {
        const text = await blob.text();
        setPageText(text);
      } else {
        const blobUrl = window.URL.createObjectURL(blob);
        latestBlobUrlRef.current = blobUrl;
        setPageUrl(blobUrl);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to render this page.",
      );
    }
  };

  const handleGoToPage = () => {
    const parsed = Number.parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(page));
      return;
    }
    const clamped = Math.min(Math.max(parsed, 1), totalPages);
    if (clamped !== page) {
      void loadPage(clamped);
    } else {
      setPageInput(String(page));
    }
  };

  const handlePageInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleGoToPage();
    if (event.key === "Escape") setPageInput(String(page));
  };

  const isLoading = isStreamable
    ? isLoadingStreamStatus ||
      isCreatingStreamSession ||
      streamStatus?.status === "processing"
    : isTileable
      ? isLoadingImageStatus ||
        isCreatingImageSession ||
        imageStatus?.status === "processing"
      : isLoadingPage;

  const renderStreamState = () => {
    if (streamStatus?.status === "processing") {
      return (
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Preparing stream segments. This may take a moment...</p>
        </div>
      );
    }

    if (streamStatus?.status === "failed") {
      return (
        <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          <p>Stream processing failed for this file.</p>
          <Button
            variant="outline"
            disabled={isReprocessingStream}
            onClick={async () => {
              setError(null);
              await reprocessStream(fileId);
              await queryClient.invalidateQueries({
                queryKey: ["stream-status", fileId],
              });
            }}
          >
            {isReprocessingStream ? "Reprocessing..." : "Retry processing"}
          </Button>
        </div>
      );
    }

    if (streamStatus?.status === "unavailable") {
      return (
        <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          Streaming is not available for this file.
        </div>
      );
    }

    if (streamSession) {
      return (
        <HlsPlayer
          manifestUrl={streamSession.manifestUrl}
          isAudio={mimeType?.startsWith("audio/")}
          title={title}
        />
      );
    }

    return (
      <div className="text-sm text-muted-foreground">Starting playback...</div>
    );
  };

  const renderTileState = () => {
    if (imageStatus?.status === "processing") {
      return (
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>
            Building encrypted tiles
            {isPdf && imageStatus.readyPages != null
              ? ` (${imageStatus.readyPages}/${imageStatus.totalPages ?? "?"} pages)`
              : ""}
            . Large files may take a minute…
          </p>
        </div>
      );
    }

    if (
      imageStatus?.status === "failed" ||
      imageStatus?.status === "unavailable"
    ) {
      return (
        <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          <p>
            {imageStatus?.status === "unavailable"
              ? "Secure tile profile not found. Owner can generate tiles below."
              : "Tile processing failed."}
          </p>
          <Button
            variant="outline"
            disabled={isReprocessingImageTiles}
            onClick={async () => {
              setError(null);
              setImageSession(null);
              await reprocessImageTiles(fileId);
              await queryClient.invalidateQueries({
                queryKey: ["image-tile-status", fileId],
              });
            }}
          >
            {isReprocessingImageTiles
              ? "Reprocessing…"
              : "Generate secure tiles"}
          </Button>
        </div>
      );
    }

    if (imageSession) {
      return (
        <SecureTileViewer
          key={`${imageSession.sessionId}-${imageSession.page}`}
          session={imageSession}
          title={title}
        />
      );
    }

    return (
      <div className="text-sm text-muted-foreground">
        Starting secure session…
      </div>
    );
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden p-4 md:p-6">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 shrink-0 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
        </div>

        {(isPdf || (!isStreamable && !isTileable)) && (
          <div className="flex items-center gap-2 rounded-xl border bg-background px-2 py-1 shadow-sm">
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9"
              onClick={() => void loadPage(page - 1)}
              disabled={page <= 1 || isCreatingImageSession || isLoadingPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 px-1">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                onBlur={handleGoToPage}
                onKeyDown={handlePageInputKeyDown}
                disabled={isCreatingImageSession || isLoadingPage}
                className="h-9 w-14 px-1 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Page number"
              />
              <span className="text-sm text-muted-foreground">
                / {totalPages}
              </span>
            </div>

            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9"
              onClick={() => void loadPage(page + 1)}
              disabled={
                page >= totalPages || isCreatingImageSession || isLoadingPage
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <Card className="flex min-h-0 w-full flex-1 overflow-hidden">
          <CardContent className="flex min-h-0 flex-1 p-2 md:p-4">
            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-muted/30">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : error ? (
                <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
                  {error}
                </div>
              ) : isStreamable ? (
                renderStreamState()
              ) : isTileable ? (
                renderTileState()
              ) : pageUrl ? (
                <img
                  src={pageUrl}
                  alt={`${title} page ${page}`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : pageText ? (
                <div className="h-full w-full overflow-auto rounded-lg bg-slate-950 p-4 md:p-6">
                  <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed text-slate-100">
                    {pageText}
                  </pre>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Rendering...</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
