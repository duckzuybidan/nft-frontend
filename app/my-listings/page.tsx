import { MyListingsView } from "@/components/market/my-listings-view";
import { ListChecks } from "lucide-react";

export default function MyListingsPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
        </div>
        <p className="text-muted-foreground">
          Update prices and toggle active status for your market items.
        </p>
      </div>

      <MyListingsView />
    </div>
  );
}
