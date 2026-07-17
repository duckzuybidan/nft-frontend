"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { searchMarketplaceApi } from "@/apis/homepage";
import { CollectionCard } from "@/components/collection/collection-card";
import { Loader2, Search } from "lucide-react";
import { shortAddr } from "@/lib/format";
import { useLocale } from "@/lib/locale-provider";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const { t } = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchMarketplaceApi(q),
    enabled: q.length > 0,
  });

  if (!q) {
    return (
      <div className="surface-card p-10 text-center text-sm text-muted-foreground">
        {t("searchHint")}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display mb-4 text-xl font-semibold">
          {t("collections")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.collections || []).map((c: any) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
          {!(data?.collections || []).length && (
            <p className="col-span-full text-sm text-muted-foreground">
              {t("noCollections")}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-semibold">{t("nfts")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.nfts || []).map((f: any) => (
            <div key={f.id} className="surface-card hover-lift p-4">
              <div className="flex gap-3">
                {f.metadata?.previewImage && (
                  <img
                    src={f.metadata.previewImage}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {f.metadata?.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {f.collection?.name || t("noCollections")}
                  </p>
                  {f.listing?.id && (
                    <Link
                      className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                      href={`/market/${f.listing.id}`}
                    >
                      {t("viewListing")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!(data?.nfts || []).length && (
            <p className="col-span-full text-sm text-muted-foreground">
              {t("noNfts")}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-semibold">
          {t("creators")}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(data?.creators || []).map((u: any) => (
            <div
              key={u.id}
              className="surface-card flex items-center gap-3 p-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                {u.walletAddress?.slice(2, 4)?.toUpperCase() || "?"}
              </span>
              <span className="font-mono text-sm">
                {shortAddr(u.walletAddress, 6)}
              </span>
            </div>
          ))}
          {!(data?.creators || []).length && (
            <p className="text-sm text-muted-foreground">{t("noCreators")}</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SearchPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-[60vh] pb-16">
      <div className="border-b border-border/60 section-band">
        <div className="container mx-auto px-4 py-10">
          <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <Search className="h-3.5 w-3.5" />
            {t("discover")}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {t("search")}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          }
        >
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
