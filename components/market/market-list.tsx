"use client";

import { useMarket } from "@/hooks/market-hook";
import { MarketCard } from "./market-card";
import { Loader2, Store } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useLocale } from "@/lib/locale-provider";

export function MarketList() {
  const { listings, isLoading, error, pagination, isFetching } = useMarket();
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("fetchingListings")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-destructive">
          Failed to load marketplace. Please try again later.
        </p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center justify-center border-dashed py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Store className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="font-display text-lg font-semibold">
          {t("marketplaceEmpty")}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {t("marketplaceEmptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isFetching && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {listings.map((listing) => (
          <MarketCard key={listing.id} listing={listing} />
        ))}
      </div>
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setPage}
      />
    </div>
  );
}
