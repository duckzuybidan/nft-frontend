"use client";

import Link from "next/link";
import { useState } from "react";
import { useSecondaryMarket } from "@/hooks/secondary-hook";
import { Button } from "@/components/ui/button";
import { Loader2, Copy } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useLocale } from "@/lib/locale-provider";

export default function BuyCopiesPage() {
  const [page, setPage] = useState(1);
  const { listings, pagination, isLoading, buy, isBuying } =
    useSecondaryMarket(page);
  const { t } = useLocale();

  return (
    <div className="min-h-[70vh] pb-16">
      <div className="border-b border-border/60 section-band">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Copy className="h-3.5 w-3.5" />
                {t("secondaryMarket")}
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {t("buyCopiesTitle")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                {t("buyCopiesDesc")}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/my-copy-listings">{t("myCopyListings")}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {listings.map((listing: any) => (
                <div
                  key={listing.id}
                  className="surface-card hover-lift group overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {listing.file?.metadata?.previewImage && (
                      <img
                        src={listing.file.metadata.previewImage}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="space-y-2 p-3.5">
                    <p className="truncate text-sm font-medium">
                      {listing.file?.metadata?.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {listing.file?.collection?.name || t("copy")} · ×
                      {listing.remaining}
                    </p>
                    <p className="text-sm font-semibold tabular-nums">
                      {listing.pricePerPass} ETH / {t("copy").toLowerCase()}
                    </p>
                    <Button
                      className="w-full rounded-full"
                      size="sm"
                      disabled={isBuying}
                      onClick={() =>
                        buy({
                          id: listing.id,
                          onChainListingId: listing.onChainListingId,
                          amount: 1,
                          pricePerPass: String(listing.pricePerPass),
                        })
                      }
                    >
                      {isBuying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("buyOneCopy")
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {!listings.length && (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 text-center text-sm text-muted-foreground">
                {t("emptySecondary")}
              </div>
            )}
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
