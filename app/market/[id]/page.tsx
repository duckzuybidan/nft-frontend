"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListingApi } from "@/apis/market";
import { ListingType } from "@/types/listing-type";
import {
  FileText,
  Film,
  Music,
  Type,
  ShoppingCart,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useAuth } from "@/hooks/auth-hook";
import { useMarket } from "@/hooks/market-hook";
import { EditListingModal } from "@/components/market/edit-listing-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/locale-provider";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLocale();
  const [listing, setListing] = useState<ListingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { address } = useAuth();
  const { removeListing, isRemoving, buyFile, isBuying, buyCopy, isBuyingCopy } =
    useMarket();

  const listingId = params.id as string;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingApi(listingId);
        setListing(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const refreshListing = async () => {
    try {
      const data = await getListingApi(listingId);
      setListing(data);
    } catch (error) {
      console.error(error);
      router.push("/my-listings");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center min-h-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="text-center py-20">
          <p className="text-destructive">Listing not found</p>
          <Button className="mt-4" onClick={() => router.push("/market")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const isOwner =
    address?.toLowerCase() === listing.file.user.walletAddress.toLowerCase();

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return null;
    if (mimeType.startsWith("video/"))
      return <Film className="h-16 w-16 text-blue-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-16 w-16 text-purple-500" />;
    if (mimeType.startsWith("text/"))
      return <Type className="h-16 w-16 text-orange-500" />;
    return <FileText className="h-16 w-16 text-gray-500" />;
  };

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove this listing?")) {
      await removeListing(listing.id);
      router.push("/market");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-10">
      <Button
        variant="ghost"
        className="mb-6 rounded-full"
        onClick={() => router.push("/market")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToMarketplace")}
      </Button>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="surface-card overflow-hidden">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted/40">
            {listing.file.metadata.previewImage ? (
              <img
                src={listing.file.metadata.previewImage}
                alt={listing.file.metadata.fileName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                {getFileIcon(listing.file.metadata.mimeType)}
                <span className="font-mono text-sm uppercase text-muted-foreground">
                  {listing.file.metadata.mimeType.split("/")[1]}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {listing.file.metadata.fileName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {formatBytes(listing.file.metadata.size)}
              </Badge>
              <Badge variant="outline">{listing.file.metadata.mimeType}</Badge>
            </div>
          </div>

          <div className="surface-card space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("owner")}
                </h3>
                <p className="font-mono text-sm">
                  {listing.file.user.walletAddress.slice(0, 6)}...
                  {listing.file.user.walletAddress.slice(-4)}
                </p>
              </div>
              <div>
                <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("listed")}
                </h3>
                <p className="text-sm">
                  {new Date(listing.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-border/70 pt-5">
              <h3 className="font-display mb-3 text-lg font-semibold">
                {t("pricing")}
              </h3>
              <div className="space-y-3">
                {listing.buyPrice && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <ShoppingCart className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="font-medium">{t("buyContent")}</span>
                        <p className="text-xs text-muted-foreground">
                          {t("buyContentHint")}
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-xl font-semibold tabular-nums text-primary">
                      {listing.buyPrice} ETH
                    </span>
                  </div>
                )}
                {(listing.copyPrice ?? listing.hirePrice) && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                        <Copy className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="font-medium">{t("buyCopy")}</span>
                        <p className="text-xs text-muted-foreground">
                          {t("buyCopyHint")}
                          {listing.copiesRemaining != null
                            ? ` · ${listing.copiesRemaining} ${t("remaining")}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-xl font-semibold tabular-nums">
                      {listing.copyPrice ?? listing.hirePrice} ETH
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1">
              {isOwner ? (
                <div className="flex w-full gap-3">
                  <Button
                    className="h-11 flex-1 rounded-full"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    {t("editListing")}
                  </Button>
                  <Button
                    className="h-11 flex-1 rounded-full"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isRemoving}
                  >
                    {t("removeListing")}
                  </Button>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  {listing.buyPrice && (
                    <Button
                      className="h-12 flex-1 rounded-full text-base font-semibold"
                      onClick={() =>
                        buyFile({
                          fileId: listing.id,
                          tokenID: listing.tokenId || "",
                          price: String(listing.buyPrice),
                        })
                      }
                      disabled={isBuying}
                    >
                      {isBuying
                        ? t("buying")
                        : `${t("buyContent")} ${listing.buyPrice} ETH`}
                    </Button>
                  )}
                  {(listing.copyPrice ?? listing.hirePrice) && (
                    <Button
                      className="h-12 flex-1 rounded-full text-base font-semibold"
                      variant="secondary"
                      disabled={isBuyingCopy || listing.copiesSoldOut}
                      onClick={() =>
                        buyCopy({
                          listingId: listing.id,
                          tokenId: listing.tokenId || "",
                          price: String(
                            listing.copyPrice ?? listing.hirePrice,
                          ),
                        })
                      }
                    >
                      {isBuyingCopy
                        ? t("buying")
                        : listing.copiesSoldOut
                          ? t("soldOut")
                          : `${t("buyCopy")} ${listing.copyPrice ?? listing.hirePrice} ETH`}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditListingModal
        listing={listing}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={refreshListing}
      />
    </div>
  );
}
