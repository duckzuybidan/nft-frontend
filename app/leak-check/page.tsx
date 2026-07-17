"use client";

import { useRef, useState } from "react";
import {
  detectWatermarkApi,
  type LeakDetectResponse,
  type LeakResult,
} from "@/apis/watermark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Upload,
  FileSearch,
} from "lucide-react";
import { toast } from "sonner";

function ResultCard({
  result,
  captureType,
}: {
  result: LeakResult;
  captureType: string;
}) {
  return (
    <Card className="border-emerald-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-emerald-500">
          <ShieldCheck className="h-5 w-5" />
          Watermark Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
          {result.nft?.previewImage && (
            <img
              src={result.nft.previewImage}
              alt=""
              className="h-28 w-28 rounded-lg border object-cover"
            />
          )}
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Confidence</dt>
              <dd className="font-semibold">{result.confidence}%</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Watermark ID</dt>
              <dd className="font-mono font-semibold">{result.wmId}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">NFT</dt>
              <dd>
                {result.nft?.name ?? "Unknown"}
                {result.nft?.tokenId ? ` (#${result.nft.tokenId})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Collection</dt>
              <dd>{result.nft?.collection ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Viewer Wallet</dt>
              <dd className="font-mono">
                {result.viewerWallet.slice(0, 10)}…
                {result.viewerWallet.slice(-6)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Viewing Session</dt>
              <dd className="font-mono text-xs break-all">
                {result.sessionId}
                {result.page > 0 ? ` · page ${result.page}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Viewed At</dt>
              <dd>
                {new Date(result.viewedAt).toLocaleString("en-GB", {
                  timeZone: "UTC",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                UTC
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Capture Type</dt>
              <dd>{captureType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Integrity</dt>
              <dd>{result.integrity}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeakCheckPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [response, setResponse] = useState<LeakDetectResponse | null>(null);

  const pickFile = (picked: File | null) => {
    setResponse(null);
    setFile(picked);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(picked ? URL.createObjectURL(picked) : null);
  };

  const analyze = async () => {
    if (!file) return;
    setChecking(true);
    setResponse(null);
    try {
      const res = await detectWatermarkApi(file);
      setResponse(res);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Detection failed — try another image",
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <FileSearch className="h-7 w-7" />
          Leak Detection Portal
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a suspected leak — original export, screenshot, camera photo,
          cropped or re-compressed image. The platform will attempt to recover
          the invisible forensic watermark and identify the viewing session it
          was issued to.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center hover:bg-muted/40"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="upload preview"
                className="max-h-56 rounded-lg object-contain"
              />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click or drop an image here (JPEG, PNG, WebP — up to 20 MB)
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="truncate text-sm text-muted-foreground">
              {file ? file.name : "No file selected"}
            </p>
            <Button onClick={analyze} disabled={!file || checking}>
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                "Detect watermark"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {checking && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Preprocessing, searching scales/rotations, decoding payload… this can
          take a few seconds.
        </p>
      )}

      {response && (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Capture type: <span className="font-medium">{response.captureType}</span>
          </p>

          {response.found ? (
            response.results.map((r) => (
              <ResultCard
                key={r.wmId}
                result={r}
                captureType={response.captureType}
              />
            ))
          ) : (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ShieldAlert className="h-5 w-5" />
                  No watermark detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside space-y-1 text-sm text-muted-foreground">
                  {response.diagnostics.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
