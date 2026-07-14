import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarketListingsApi,
  getMyListingsApi,
  updateListingApi,
  removeListingApi,
  listFileApi,
  buyFileApi,
  UpdateListingData,
} from "@/apis/market";
import { PaginatedResponse } from "@/types/paginated-response";
import { ListingType } from "@/types/listing-type";
import { toast } from "sonner";
import { useState } from "react";
import { nftService } from "@/services/nft";

const invalidateMarketQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["market-listings"] });
  queryClient.invalidateQueries({ queryKey: ["my-listings"] });
};

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
      data: UpdateListingData;
    }) => updateListingApi(listingId, data),
    onSuccess: () => {
      invalidateMarketQueries(queryClient);
      toast.success("Listing updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update listing");
    },
  });

  const removeListingMutation = useMutation({
    mutationFn: (listingId: string) => removeListingApi(listingId),
    onSuccess: () => {
      invalidateMarketQueries(queryClient);
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

      await listFileApi({
        ...data,
        tokenId: tokenId.toString(),
      });
    },
    onSuccess: async () => {
      await invalidateMarketQueries(queryClient);
      toast.success("File listed successfully");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to list file");
    },
  });

  const buyFileMutation = useMutation({
    mutationFn: async (data: { fileId: string; price: string }) => {
      const result = await nftService.purchaseContent(
        parseInt(data.fileId),
        data.price.toString(),
      );

      if (result?.receipt?.status === "success") {
        return await buyFileApi(data.fileId);
      }

      throw new Error("NFT purchase failed");
    },
    onSuccess: () => {
      invalidateMarketQueries(queryClient);
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

export const useMyListings = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, isFetching } = useQuery<
    PaginatedResponse<ListingType>
  >({
    queryKey: ["my-listings", page],
    queryFn: () => getMyListingsApi(page, limit),
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
  };
};
