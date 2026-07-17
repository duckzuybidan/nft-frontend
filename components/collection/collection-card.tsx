"use client";

import Link from "next/link";
import { formatEth, formatCompact, shortAddr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-provider";

type CollectionLike = {
  id?: string;
  slug: string;
  name: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  category?: string | null;
  creator?: { walletAddress?: string | null } | null;
  stats?: {
    floorPrice?: number | null;
    totalVolume?: number | null;
    totalItems?: number | null;
    totalOwners?: number | null;
  } | null;
  _count?: { files?: number } | null;
};

export function CollectionCard({
  collection,
  className,
  featured,
}: {
  collection: CollectionLike;
  className?: string;
  featured?: boolean;
}) {
  const { t } = useLocale();
  const items =
    collection.stats?.totalItems ?? collection._count?.files ?? 0;

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className={cn(
        "group surface-card hover-lift relative flex flex-col overflow-hidden",
        featured && "md:row-span-1",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          featured ? "aspect-[16/9] md:aspect-[2/1]" : "aspect-[16/10]",
        )}
      >
        {collection.bannerUrl || collection.logoUrl ? (
          <img
            src={collection.bannerUrl || collection.logoUrl || ""}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {collection.logoUrl && (
          <img
            src={collection.logoUrl}
            alt=""
            className="absolute bottom-3 left-3 h-12 w-12 rounded-full border-2 border-white/20 object-cover shadow-lg ring-2 ring-black/20"
            loading="lazy"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-4">
        <div>
          <p className="font-display truncate text-base font-semibold tracking-tight">
            {collection.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {collection.category || t("collections")}
            {collection.creator?.walletAddress
              ? ` · ${shortAddr(collection.creator.walletAddress)}`
              : ""}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
          <Stat
            label={t("floor")}
            value={formatEth(collection.stats?.floorPrice)}
          />
          <Stat
            label={t("volume")}
            value={formatEth(collection.stats?.totalVolume)}
          />
          <Stat label={t("items")} value={formatCompact(items)} />
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}
