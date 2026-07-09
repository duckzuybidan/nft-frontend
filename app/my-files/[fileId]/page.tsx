"use client";

import React, { useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Maximize2, ArrowLeft } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { streamFileUrl, getFile } from "@/apis/file";
import { useRouter } from "next/navigation";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FileMetadata } from "@/apis/file/get-file";

const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  },
);

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});

interface FileViewerPageProps {
  params: Promise<{ fileId: string }>;
}

export default function FileViewerPage({ params }: FileViewerPageProps) {
  const router = useRouter();
  const { fileId } = React.use(params);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([1]));
  const containerRef = useRef<HTMLDivElement>(null);

  const pageRefs = useMemo(() => {
    const refs: Record<number, React.RefObject<HTMLDivElement>> = {};
    for (let i = 1; i <= numPages; i++) {
      refs[i] = React.createRef();
    }
    return refs;
  }, [numPages]);

  useEffect(() => {
    import("react-pdf").then(({ pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      setPdfjsLoaded(true);
    });
  }, []);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        const metadata = await getFile(fileId);
        setFileMetadata(metadata);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load file"));
      } finally {
        setIsLoading(false);
      }
    };

    if (fileId) {
      fetchMetadata();
    }
  }, [fileId]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setVisiblePages(new Set([1]));
    },
    [],
  );

  const onLoadError = useCallback((error: Error) => {
    console.error("Error loading PDF:", error);
  }, []);

  const zoomIn = () => setScale((s) => s + 0.25);
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));

  useEffect(() => {
    if (!containerRef.current || numPages === 0) return;

    const observerOptions = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      setVisiblePages((prev) => {
        const newSet = new Set(prev);
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.dataset.pageNum || "0");
          if (pageNum > 0) {
            if (entry.isIntersecting) {
              newSet.add(pageNum);
            } else {
              newSet.delete(pageNum);
            }
          }
        });
        return newSet;
      });
    }, observerOptions);

    Object.entries(pageRefs).forEach(([pageNum, ref]) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pageRefs, numPages]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !fileMetadata) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-destructive mb-4">
          {error?.message || "Failed to load file"}
        </p>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  const fileUrl = streamFileUrl(fileMetadata.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-lg font-semibold truncate flex-1 mx-4 text-center">
          {fileMetadata.fileName}
        </h1>
        <div className="flex items-center gap-4">
          {fileMetadata.mimeType === "application/pdf" && (
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
              <Button variant="ghost" size="icon" onClick={zoomOut}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={zoomIn}>
                <Maximize2 className="h-4 w-4 rotate-45" />
              </Button>
            </div>
          )}
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            download={fileMetadata.fileName}
          >
            <Button variant="ghost">Download</Button>
          </a>
        </div>
      </header>
      <main ref={containerRef} className="flex-1 overflow-auto bg-gray-100">
        {fileMetadata.mimeType === "application/pdf" && pdfjsLoaded ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onLoadError}
              loading={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
              error={
                <div className="text-center p-8">
                  <p className="text-destructive mb-4">Error loading PDF</p>
                </div>
              }
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <div
                    key={pageNum}
                    ref={pageRefs[pageNum]}
                    data-page-num={pageNum}
                    className="bg-white shadow-md rounded"
                  >
                    {visiblePages.has(pageNum) ? (
                      <Page
                        pageNumber={pageNum}
                        scale={scale}
                        loading={
                          <div className="flex items-center justify-center py-40">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-[612px] h-[792px] bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-medium">
                        Page {pageNum} (Loading on scroll)
                      </div>
                    )}
                  </div>
                ),
              )}
            </Document>
          </div>
        ) : fileMetadata.mimeType.startsWith("video/") ? (
          <div className="flex items-center justify-center h-full">
            <video
              controls
              className="max-h-[80vh] max-w-[90vw]"
              src={fileUrl}
            />
          </div>
        ) : fileMetadata.mimeType.startsWith("audio/") ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-lg">
              <audio controls className="w-full" src={fileUrl} />
            </div>
          </div>
        ) : fileMetadata.mimeType.startsWith("image/") ? (
          <div className="flex items-center justify-center h-full">
            <img
              src={fileUrl}
              alt={fileMetadata.fileName}
              className="max-h-[80vh] max-w-[90vw] object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                Preview not available for this file type
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
