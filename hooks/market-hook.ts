import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarketListingsApi,

  updateListingApi,
  removeListingApi,
  listFileApi,
  buyFileApi,
} from "@/apis/market";
import { PaginatedResponse } from "@/types/paginated-response";
import { ListingType } from "@/types/listing-type";
import { toast } from "sonner";
import { useState } from "react";

import {nftService} from "@/services/nft";


export const useMarket = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, isFetching } = useQuery<
    PaginatedResponse<ListingType>
  >({
    queryKey: ["market-listings", page],
    queryFn: async (): Promise<PaginatedResponse<ListingType>> => {
      const response = await getMarketListingsApi(page, limit);
      return {
        ...response,
        data: response.data.map((item) => item),
      };
    },
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
    mutationFn: async (data: {
      fileId: string; 

      hirePrice?: string;
      buyPrice?: string;
    }) => {  
      const { tokenId } = await nftService.publishContent({
        metadataURI: data.fileId,
        contentHash:
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        contentType: 0,
        title: "Movie",
      });
      
      console.log("tokenId:", tokenId);
      await listFileApi({
        ...data,
        tokenId: tokenId.toString(),
      });
 
    },

    onSuccess: async () => { 
      await queryClient.invalidateQueries({
        queryKey: ["market-listings"],
      });

      toast.success("File listed successfully");
    },

    onError: (error: any) => {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to list file"
      );
    },
  });

  const buyFileMutation = useMutation({
    mutationFn: (listingId: string) => buyFileApi(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-listings"] });
      toast.success("File bought successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to buy file");
    },
  });

  return {
    listings: data?.data || [],
    isLoading,
    isFetching,
    error,
    pagination: {
      page: data?.page || 1,
      totalPages: data?.totalPages || 1,
      total: data?.total || 0,
      setPage,
    },
    updateListing: updateListingMutation.mutateAsync,
    isUpdating: updateListingMutation.isPending,
    removeListing: removeListingMutation.mutateAsync,
    isRemoving: removeListingMutation.isPending,
    listFile: listFileMutation.mutateAsync,
    isListing: listFileMutation.isPending,
    buyFile: buyFileMutation.mutateAsync,
    isBuying: buyFileMutation.isPending,
  };
};