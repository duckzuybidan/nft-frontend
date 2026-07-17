export function shortAddr(addr?: string | null, size = 4) {
  if (!addr) return "—";
  if (addr.length < size * 2 + 2) return addr;
  return `${addr.slice(0, size + 2)}…${addr.slice(-size)}`;
}

export function formatEth(v?: number | string | null, digits = 4) {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "string" ? Number(v) : v;
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(digits)} ETH`;
}

export function formatCompact(n?: number | null) {
  if (n === null || n === undefined) return "0";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function relativeTime(iso?: string | null) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
