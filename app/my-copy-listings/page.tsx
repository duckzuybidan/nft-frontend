"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMySecondary } from "@/hooks/secondary-hook";
import { useMyFiles } from "@/hooks/file-hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function MyCopyListingsContent() {
  const searchParams = useSearchParams();
  const {
    active,
    sold,
    purchases,
    isLoading,
    listCopy,
    isListing,
    cancel,
    isCancelling,
  } = useMySecondary();
  const { copyFiles } = useMyFiles();
  const [tab, setTab] = useState<"active" | "sold" | "purchases" | "list">(
    "active",
  );
  const [fileId, setFileId] = useState("");
  const [amount, setAmount] = useState("1");
  const [price, setPrice] = useState("0.01");

  useEffect(() => {
    const fromQuery = searchParams.get("fileId");
    if (!fromQuery) return;
    setFileId(fromQuery);
    setTab("list");
  }, [searchParams]);

  const selected = useMemo(
    () => copyFiles.find((f) => f.id === fileId),
    [copyFiles, fileId],
  );

  const onList = async () => {
    if (!selected?.tokenId) {
      toast.error("Select a licensed copy with a token id");
      return;
    }
    await listCopy({
      fileId: selected.id,
      tokenId: String(selected.tokenId),
      amount: Number.parseInt(amount, 10) || 1,
      pricePerPass: price,
    });
    setTab("active");
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Copy Listings</h1>
          <p className="text-muted-foreground">
            Manage secondary ERC-1155 listings and purchase history.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/market/copies">Browse Buy Copies</Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["active", "Active"],
            ["sold", "Closed / Sold"],
            ["purchases", "Purchases"],
            ["list", "List a copy"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={tab === key ? "default" : "outline"}
            onClick={() => setTab(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
      ) : tab === "list" ? (
        <div className="max-w-md space-y-4 rounded-xl border p-6">
          <label className="text-sm font-medium">Your licensed copies</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
          >
            <option value="">Select copy…</option>
            {copyFiles.map((f) => (
              <option key={f.id} value={f.id}>
                {f.fileName} (×{f.copyBalance ?? 1})
              </option>
            ))}
          </select>
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Price per copy (ETH)</label>
            <Input
              type="number"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <Button onClick={onList} disabled={isListing || !fileId}>
            {isListing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "List on secondary market"
            )}
          </Button>
          {!copyFiles.length && (
            <p className="text-sm text-muted-foreground">
              Buy a primary copy first (Buy Copy on the market).
            </p>
          )}
        </div>
      ) : tab === "purchases" ? (
        <div className="space-y-3">
          {purchases.map((p: any) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{p.file?.metadata?.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  from {p.seller?.walletAddress?.slice(0, 10)}… · ×{p.amount}
                </p>
              </div>
              <p className="text-sm font-semibold">{p.price} ETH</p>
            </div>
          ))}
          {!purchases.length && (
            <p className="text-muted-foreground">No secondary purchases yet.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {(tab === "active" ? active : sold).map((listing: any) => (
            <div
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {listing.file?.metadata?.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {listing.pricePerPass} ETH · remaining {listing.remaining}/
                  {listing.amount}
                </p>
              </div>
              {tab === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isCancelling}
                  onClick={() =>
                    cancel({
                      id: listing.id,
                      onChainListingId: listing.onChainListingId,
                    })
                  }
                >
                  Cancel
                </Button>
              )}
            </div>
          ))}
          {!(tab === "active" ? active : sold).length && (
            <p className="text-muted-foreground">Nothing here yet.</p>
          )}
        </div>
      )}
    </>
  );
}

export default function MyCopyListingsPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin" />}>
        <MyCopyListingsContent />
      </Suspense>
    </div>
  );
}
