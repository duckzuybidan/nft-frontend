"use client";

import Link from "next/link";
import { formatBytes } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Film, Music, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ListingType } from "@/types/listing-type";
import { useAuth } from "@/hooks/auth-hook";
import { useMarket } from "@/hooks/market-hook";
import { EditListingModal } from "./edit-listing-modal";

interface MarketCardProps {
  listing: ListingType;
}

export function MarketCard({ listing }: MarketCardProps) {
  const { address } = useAuth();
  const { removeListing, isRemoving, buyFile, isBuying } = useMarket();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { id, file, hirePrice, buyPrice } = listing;

  const isOwner =
    address?.toLowerCase() === file.user.walletAddress.toLowerCase();

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove this listing?")) {
      await removeListing(id);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return null;
    if (mimeType.startsWith("video/"))
      return <Film className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-8 w-8 text-purple-500" />;
    if (mimeType.startsWith("text/"))
      return <Type className="h-8 w-8 text-orange-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <Link href={`/market/${id}`} className="block">
      <Card className="overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors cursor-pointer">
        {/* Image Container */}
        <div className="w-full h-48 relative bg-muted flex items-center justify-center overflow-hidden">
          {file.metadata.previewImage ? (
            <img
              src={file.metadata.previewImage}
              alt={file.metadata.fileName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              {getFileIcon(file.metadata.mimeType)}
              <span className="text-xs text-muted-foreground uppercase">
                {file.metadata.mimeType.split("/")[1]}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 flex flex-col flex-1">
          <h3
            className="font-medium line-clamp-2 mb-2"
            title={file.metadata.fileName}
          >
            {file.metadata.fileName}
          </h3>

          <div className="text-xs text-muted-foreground mb-3">
            {formatBytes(file.metadata.size)}
          </div>

          {/* Pricing */}
          <div className="space-y-2 mb-4">
            {buyPrice && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Buy</span>
                <span className="font-bold text-primary">{buyPrice} ETH</span>
              </div>
            )}
            {hirePrice && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Hire</span>
                <span className="font-bold">{hirePrice} ETH</span>
              </div>
            )}
          </div>

          {!isOwner ? (
            <div className="flex w-full gap-2 mt-auto">
              {buyPrice && (
                <Button
                  className="flex-1 h-9 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    buyFile(id);
                  }}
                  disabled={isBuying}
                >
                  {isBuying ? "Buying..." : "Buy"}
                </Button>
              )}
              {hirePrice && (
                <Button
                  className="flex-1 h-9 text-sm"
                  variant="secondary"
                  onClick={(e) => e.preventDefault()}
                >
                  Hire
                </Button>
              )}
            </div>
          ) : (
            <div className="flex w-full gap-2 mt-auto">
              <Button
                className="flex-1 h-9 text-sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                className="flex-1 h-9 text-sm"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove();
                }}
                disabled={isRemoving}
              >
                Remove
              </Button>
            </div>
          )}
        </CardContent>

        <EditListingModal
          listing={listing}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Card>
    </Link>
  );
}
