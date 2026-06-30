"use client";

import { useMarket } from "@/hooks/market-hook";
import { MarketCard } from "./market-card";
import { Loader2, Store } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

export function MarketList() {
  const { listings, isLoading, error, pagination, isFetching } = useMarket();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          Fetching marketplace listings...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">
          Failed to load marketplace. Please try again later.
        </p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card className="border-dashed flex flex-col items-center justify-center py-20 bg-muted/5">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Marketplace is empty</CardTitle>
          <CardDescription>
            No files are currently listed for sale or hire.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isFetching && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
