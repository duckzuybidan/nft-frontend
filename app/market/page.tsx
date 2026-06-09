import { MarketList } from "@/components/market/market-list";
import { ShoppingBag } from "lucide-react";

export default function MarketPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        </div>
        <p className="text-muted-foreground">
          Browse and acquire digital assets from other users.
        </p>
      </div>

      <MarketList />
    </div>
  );
}
