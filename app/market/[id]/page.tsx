"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListingApi } from "@/apis/market";
import { ListingType } from "@/types/listing-type";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Film,
  Music,
  Type,
  Eye,
  ShoppingCart,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { openFileApi } from "@/apis/file";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth-hook";
import { useMarket } from "@/hooks/market-hook";
import { EditListingModal } from "@/components/market/edit-listing-modal";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { address } = useAuth();
  const { removeListing, isRemoving } = useMarket();

  const listingId = params.id as string;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingApi(listingId);
        setListing(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center min-h-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="text-center py-20">
          <p className="text-destructive">Listing not found</p>
          <Button className="mt-4" onClick={() => router.push("/market")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const isOwner =
    address?.toLowerCase() === listing.file.user.walletAddress.toLowerCase();

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return null;
    if (mimeType.startsWith("video/"))
      return <Film className="h-16 w-16 text-blue-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-16 w-16 text-purple-500" />;
    if (mimeType.startsWith("text/"))
      return <Type className="h-16 w-16 text-orange-500" />;
    return <FileText className="h-16 w-16 text-gray-500" />;
  };

  const handleOpen = async () => {
    try {
      setIsOpening(true);
      toast.loading("Opening file...", { id: "open-file" });
      const blob = await openFileApi(listing.file.id);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: listing.file.metadata.mimeType }),
      );
      window.open(url, "_blank");
      toast.success("File opened", { id: "open-file" });
    } catch (error) {
      toast.error("Failed to open file", { id: "open-file" });
    } finally {
      setIsOpening(false);
    }
  };

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove this listing?")) {
      await removeListing(listing.id);
      router.push("/market");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/market")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image/Preview Section */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-square relative bg-muted/20 flex items-center justify-center overflow-hidden">
              {listing.file.metadata.previewImage ? (
                <img
                  src={listing.file.metadata.previewImage}
                  alt={listing.file.metadata.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {getFileIcon(listing.file.metadata.mimeType)}
                  <span className="text-sm font-mono text-muted-foreground uppercase">
                    {listing.file.metadata.mimeType.split("/")[1]}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Button className="w-full" onClick={handleOpen} disabled={isOpening}>
            <Eye className="h-4 w-4 mr-2" />
            Preview File
          </Button>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {listing.file.metadata.fileName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {formatBytes(listing.file.metadata.size)}
                </Badge>
                <Badge variant="outline">
                  {listing.file.metadata.mimeType}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Owner
                </h3>
                <p className="font-mono">
                  {listing.file.user.walletAddress.slice(0, 6)}...
                  {listing.file.user.walletAddress.slice(-4)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Listed At
                </h3>
                <p>{new Date(listing.createdAt).toLocaleString()}</p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                <div className="space-y-3">
                  {listing.buyPrice && (
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        <span className="font-medium">Buy Now</span>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {listing.buyPrice} ETH
                      </span>
                    </div>
                  )}
                  {listing.hirePrice && (
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-medium">Hire</span>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {listing.hirePrice} ETH
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              {isOwner ? (
                <div className="flex w-full gap-3">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Listing
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isRemoving}
                  >
                    Remove Listing
                  </Button>
                </div>
              ) : (
                <div className="flex w-full gap-3">
                  {listing.buyPrice && (
                    <Button className="flex-1 h-12 text-lg font-semibold shadow-md hover:shadow-lg transition-shadow">
                      Buy {listing.buyPrice} ETH
                    </Button>
                  )}
                  {listing.hirePrice && (
                    <Button
                      className="flex-1 h-12 text-lg font-semibold shadow-sm"
                      variant="default"
                      style={{
                        backgroundColor: "hsl(var(--muted))",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      Hire {listing.hirePrice} ETH
                    </Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <EditListingModal
        listing={listing}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
