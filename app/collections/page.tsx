"use client";

import { useQuery } from "@tanstack/react-query";
import { listCollectionsApi } from "@/apis/collection";
import { CollectionCard } from "@/components/collection/collection-card";
import { Loader2, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-provider";

export default function CollectionsIndexPage() {
  const { t } = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => listCollectionsApi({ limit: 24 }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("loadingMarketplace")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] pb-16">
      <div className="border-b border-border/60 section-band">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Layers className="h-3.5 w-3.5" />
                {t("discover")}
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {t("collectionsTitle")}
              </h1>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
                {t("collectionsDesc")}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/market">{t("browseListings")}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.data || []).map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
          {!(data?.data || []).length && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center text-sm text-muted-foreground">
              {t("emptyCollectionsPage")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
