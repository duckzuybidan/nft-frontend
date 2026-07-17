import Link from "next/link";
import { formatEth } from "@/lib/format";
import { cn } from "@/lib/utils";

type NftTileProps = {
  href: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  price?: number | string | null;
  changePct?: number | null;
  rank?: number;
  badge?: string;
  className?: string;
};

export function NftTile({
  href,
  title,
  subtitle,
  imageUrl,
  price,
  changePct,
  rank,
  badge,
  className,
}: NftTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group surface-card hover-lift relative flex flex-col overflow-hidden",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        {rank != null && (
          <span className="absolute left-2.5 top-2.5 flex h-7 min-w-7 items-center justify-center rounded-lg bg-black/65 px-2 text-xs font-bold text-white backdrop-blur-sm">
            #{rank}
          </span>
        )}
        {badge && (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            {badge}
          </span>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="truncate text-sm font-medium leading-snug">{title}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatEth(price)}
          </span>
          {changePct != null && (
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                changePct >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {changePct >= 0 ? "+" : ""}
              {changePct.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
