"use client";

import { useState } from "react";
import { formatBytes } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Film, Music, Type } from "lucide-react";
import { ListingType } from "@/types/listing-type";
import { useMarket } from "@/hooks/market-hook";
import { EditListingModal } from "./edit-listing-modal";

interface MyListingCardProps {
  listing: ListingType;
}

export function MyListingCard({ listing }: MyListingCardProps) {
  const { updateListing, isUpdating, removeListing, isRemoving } = useMarket();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { id, file, buyPrice, isActive, copiesRemaining, maxCopies } = listing;
  const copyPrice = listing.copyPrice ?? listing.hirePrice;

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

  const handleToggleActive = async () => {
    await updateListing({
      listingId: id,
      data: { isActive: !isActive },
    });
  };

  const handleRemove = async () => {
    if (confirm("Are you sure you want to deactivate this listing?")) {
      await removeListing(id);
    }
  };

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full">
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
          <div className="absolute top-2 right-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

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

          <div className="space-y-2 mb-4">
            {buyPrice != null && buyPrice !== "" && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Buy Content</span>
                <span className="font-bold text-primary">{buyPrice} ETH</span>
              </div>
            )}
            {copyPrice != null && copyPrice !== "" && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Buy Copy</span>
                <span className="font-bold">{copyPrice} ETH</span>
              </div>
            )}
            {copyPrice != null && copyPrice !== "" && copiesRemaining != null && (
              <div className="text-xs text-muted-foreground">
                {copiesRemaining} / {maxCopies ?? "—"} copies remaining
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 mt-auto">
            <div className="flex gap-2">
              <Button
                className="flex-1 h-9 text-sm"
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </Button>
              <Button
                className="flex-1 h-9 text-sm"
                variant={isActive ? "secondary" : "default"}
                onClick={handleToggleActive}
                disabled={isUpdating}
              >
                {isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
            {isActive && (
              <Button
                className="w-full h-9 text-sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={isRemoving}
              >
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <EditListingModal
        listing={listing}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
