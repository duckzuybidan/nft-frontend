"use client";

import Link from "next/link";
import { formatBytes } from "@/lib/utils";
import { FileText, Film, Music, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ListingType } from "@/types/listing-type";
import { useAuth } from "@/hooks/auth-hook";
import { useMarket } from "@/hooks/market-hook";
import { EditListingModal } from "./edit-listing-modal";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-provider";

interface MarketCardProps {
  listing: ListingType;
}

export function MarketCard({ listing }: MarketCardProps) {
  const { address } = useAuth();
  const { t } = useLocale();
  const { removeListing, isRemoving, buyFile, isBuying, buyCopy, isBuyingCopy } =
    useMarket();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { id, file, buyPrice, tokenId, copiesRemaining, copiesSoldOut } =
    listing;
  const copyPrice = listing.copyPrice ?? listing.hirePrice;

  const isOwner =
    address?.toLowerCase() === file.user.walletAddress.toLowerCase();

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove this listing?")) {
      await removeListing(id);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return null;
    if (mimeType.startsWith("video/"))
      return <Film className="h-8 w-8 text-sky-400" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-8 w-8 text-teal-400" />;
    if (mimeType.startsWith("text/"))
      return <Type className="h-8 w-8 text-amber-400" />;
    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <Link href={`/market/${id}`} className="block h-full">
      <article className="surface-card hover-lift group flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {file.metadata.previewImage ? (
            <img
              src={file.metadata.previewImage}
              alt={file.metadata.fileName}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              {getFileIcon(file.metadata.mimeType)}
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {file.metadata.mimeType.split("/")[1]}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent opacity-80" />
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {buyPrice && (
              <span className="rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                {t("content")}
              </span>
            )}
            {copyPrice && (
              <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                {t("copy")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3
            className="line-clamp-2 text-sm font-semibold leading-snug"
            title={file.metadata.fileName}
          >
            {file.metadata.fileName}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatBytes(file.metadata.size)}
          </p>

          <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
            {buyPrice && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {t("buyContent")}
                </span>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {buyPrice} ETH
                </span>
              </div>
            )}
            {copyPrice && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {t("buyCopy")}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {copyPrice} ETH
                </span>
              </div>
            )}
            {copyPrice && copiesRemaining != null && (
              <p
                className={cn(
                  "text-[11px]",
                  copiesSoldOut ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {copiesSoldOut
                  ? t("soldOut")
                  : `${copiesRemaining} ${t("copiesRemaining")}`}
              </p>
            )}
          </div>

          {!isOwner ? (
            <div className="mt-auto flex w-full gap-2 pt-4">
              {buyPrice && (
                <Button
                  className="h-9 flex-1 rounded-full text-xs font-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    buyFile({
                      fileId: id,
                      tokenID: tokenId || "",
                      price: String(buyPrice),
                    });
                  }}
                  disabled={isBuying}
                >
                  {isBuying ? t("buying") : t("buyContent")}
                </Button>
              )}
              {copyPrice && (
                <Button
                  className="h-9 flex-1 rounded-full text-xs font-semibold"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    buyCopy({
                      listingId: id,
                      tokenId: tokenId || "",
                      price: String(copyPrice),
                    });
                  }}
                  disabled={isBuyingCopy || copiesSoldOut}
                >
                  {isBuyingCopy
                    ? t("buying")
                    : copiesSoldOut
                      ? t("soldOut")
                      : t("buyCopy")}
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-auto flex w-full gap-2 pt-4">
              <Button
                className="h-9 flex-1 rounded-full text-xs"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditModalOpen(true);
                }}
              >
                {t("edit")}
              </Button>
              <Button
                className="h-9 flex-1 rounded-full text-xs"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove();
                }}
                disabled={isRemoving}
              >
                {t("remove")}
              </Button>
            </div>
          )}
        </div>

        <EditListingModal
          listing={listing}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      </article>
    </Link>
  );
}
