"use client";

import { ListingResponse } from "@/apis/market";
import { formatBytes } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Film,
  Music,
  Type,
  Eye,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { openFileApi } from "@/apis/file";
import { toast } from "sonner";
import { useState } from "react";

import { useAuth } from "@/hooks/auth-hook";
import { useMarket } from "@/hooks/market-hook";
import { EditListingModal } from "./edit-listing-modal";

interface MarketCardProps {
  listing: ListingResponse;
}

export function MarketCard({ listing }: MarketCardProps) {
  const { address } = useAuth();
  const { removeListing, isRemoving } = useMarket();
  const [isOpening, setIsOpening] = useState(false);
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
      return <Film className="h-10 w-10 text-blue-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-10 w-10 text-purple-500" />;
    if (mimeType.startsWith("text/"))
      return <Type className="h-10 w-10 text-orange-500" />;
    return <FileText className="h-10 w-10 text-gray-500" />;
  };

  const handleOpen = async () => {
    try {
      setIsOpening(true);
      toast.loading("Opening file...", { id: "open-file" });
      const blob = await openFileApi(file.id);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: file.metadata.mimeType }),
      );
      window.open(url, "_blank");
      toast.success("File opened", { id: "open-file" });
    } catch (error) {
      toast.error("Failed to open file", { id: "open-file" });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square relative bg-muted/20 flex items-center justify-center overflow-hidden group">
        {file.metadata.previewImage ? (
          <img
            src={file.metadata.previewImage}
            alt={file.metadata.fileName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {getFileIcon(file.metadata.mimeType)}
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {file.metadata.mimeType.split("/")[1]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpen}
            disabled={isOpening}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle
            className="text-sm font-bold truncate flex-1"
            title={file.metadata.fileName}
          >
            {file.metadata.fileName}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {formatBytes(file.metadata.size)}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          Owner: {file.user.walletAddress.slice(0, 6)}...
          {file.user.walletAddress.slice(-4)}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        <div className="mt-3 space-y-2">
          {buyPrice && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center">
                <ShoppingCart className="h-3 w-3 mr-1" /> Buy
              </span>
              <span className="font-bold text-primary">{buyPrice} ETH</span>
            </div>
          )}
          {hirePrice && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> Hire
              </span>
              <span className="font-bold text-primary">
                {hirePrice} ETH / day
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        {isOwner ? (
          <div className="flex w-full gap-2">
            <Button
              className="flex-1 h-8 text-xs"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
            <Button
              className="flex-1 h-8 text-xs"
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              Remove
            </Button>
          </div>
        ) : (
          <>
            {buyPrice && (
              <Button className="flex-1 h-8 text-xs" variant="default">
                Buy Now
              </Button>
            )}
            {hirePrice && (
              <Button className="flex-1 h-8 text-xs" variant="outline">
                Hire
              </Button>
            )}
          </>
        )}
      </CardFooter>

      <EditListingModal
        listing={listing}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </Card>
  );
}
