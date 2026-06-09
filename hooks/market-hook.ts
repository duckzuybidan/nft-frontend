import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarketListingsApi,
  ListingResponse,
  updateListingApi,
  removeListingApi,
  listFileApi,
} from "@/apis/market";
import { toast } from "sonner";

export const useMarket = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ListingResponse[]>({
    queryKey: ["market-listings"],
    queryFn: getMarketListingsApi,
  });

  const updateListingMutation = useMutation({
    mutationFn: ({
      listingId,
      data,
    }: {
      listingId: string;
      data: { hirePrice?: string; buyPrice?: string; tokenId?: string };
    }) => updateListingApi(listingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-listings"] });
      toast.success("Listing updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update listing");
    },
  });

  const removeListingMutation = useMutation({
    mutationFn: (listingId: string) => removeListingApi(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-listings"] });
      toast.success("Listing removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove listing");
    },
  });

  const listFileMutation = useMutation({
    mutationFn: (data: {
      fileId: string;
      tokenId?: string;
      hirePrice?: string;
      buyPrice?: string;
    }) => listFileApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-listings"] });
      toast.success("File listed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to list file");
    },
  });

  return {
    listings: data || [],
    isLoading,
    error,
    updateListing: updateListingMutation.mutateAsync,
    isUpdating: updateListingMutation.isPending,
    removeListing: removeListingMutation.mutateAsync,
    isRemoving: removeListingMutation.isPending,
    listFile: listFileMutation.mutateAsync,
    isListing: listFileMutation.isPending,
  };
};
