"use client";

import Link from "next/link";
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
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { openFileApi } from "@/apis/file";
import { toast } from "sonner";
import { useState } from "react";
import { ListingType } from "@/types/listing-type";

import { useAuth } from "@/hooks/auth-hook";
import { useMarket } from "@/hooks/market-hook";
import { EditListingModal } from "./edit-listing-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MarketCardProps {
  listing: ListingType;
}

export function MarketCard({ listing }: MarketCardProps) {
  const { address } = useAuth();
  const { removeListing, isRemoving } = useMarket();
  const [isOpening, setIsOpening] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { id, file, hirePrice, buyPrice, createdAt } = listing;

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
      return <Film className="h-12 w-12 text-blue-400" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-12 w-12 text-purple-400" />;
    if (mimeType.startsWith("text/"))
      return <Type className="h-12 w-12 text-orange-400" />;
    return <FileText className="h-12 w-12 text-gray-400" />;
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
    <Link href={`/market/${id}`} className="block group">
      <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 border-0 bg-gradient-to-b from-muted/30 to-muted/10 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        {/* Image Container */}
        <div className="aspect-[4/3] relative bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center overflow-hidden rounded-t-xl">
          {file.metadata.previewImage ? (
            <img
              src={file.metadata.previewImage}
              alt={file.metadata.fileName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 p-6">
              <div className="p-4 rounded-full bg-background/50 backdrop-blur-sm">
                {getFileIcon(file.metadata.mimeType)}
              </div>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {file.metadata.mimeType.split("/")[1]}
              </span>
            </div>
          )}

          {/* Preview overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <Button
              variant="secondary"
              size="default"
              onClick={(e) => {
                e.preventDefault();
                handleOpen();
              }}
              disabled={isOpening}
              className="w-full shadow-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview File
            </Button>
          </div>

          {/* Owner menu */}
          {isOwner && (
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit Listing
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove();
                    }}
                    disabled={isRemoving}
                    className="text-destructive"
                  >
                    Remove Listing
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Content */}
        <CardHeader className="p-5 pb-3">
          <div className="flex justify-between items-start gap-3 mb-2">
            <CardTitle
              className="text-base font-semibold line-clamp-2 flex-1 leading-tight"
              title={file.metadata.fileName}
            >
              {file.metadata.fileName}
            </CardTitle>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {formatBytes(file.metadata.size)}
            </Badge>
            {buyPrice && (
              <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Buy Now
              </Badge>
            )}
            {hirePrice && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Hire
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-5 pt-0 pb-3 flex-1">
          <div className="space-y-3">
            {/* Owner info
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                {file.user.walletAddress.slice(2, 4).toUpperCase()}
              </div>
              <span className="font-mono">
                {file.user.walletAddress.slice(0, 6)}...
                {file.user.walletAddress.slice(-4)}
              </span>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              {buyPrice && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Price
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {buyPrice} ETH
                  </span>
                </div>
              )}
              {hirePrice && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted/50">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Hire Price
                  </span>
                  <span className="text-lg font-bold">
                    {hirePrice} ETH
                  </span>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="text-[10px] text-muted-foreground/70">
              Listed {new Date(createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          {!isOwner ? (
            <div className="flex w-full gap-2">
              {buyPrice && (
                <Button
                  className="flex-1 h-9"
                  onClick={(e) => e.preventDefault()}
                >
                  Buy Now
                </Button>
              )}
              {hirePrice && (
                <Button
                  className="flex-1 h-9"
                  variant="secondary"
                  onClick={(e) => e.preventDefault()}
                >
                  Hire
                </Button>
              )}
            </div>
          ) : null}
        </CardFooter>

        <EditListingModal
          listing={listing}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Card>
    </Link>
  );
}
