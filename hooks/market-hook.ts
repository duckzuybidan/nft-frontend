import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarketListingsApi,
  getMyListingsApi,
  updateListingApi,
  removeListingApi,
  listFileApi,
  buyFileApi,
  createNftMetadataApi,
  UpdateListingData,
} from "@/apis/market";
import buyCopyApi from "@/apis/market/buy-copy-api";
import { syncOwnershipApi } from "@/apis/auth";
import { PaginatedResponse } from "@/types/paginated-response";
import { ListingType } from "@/types/listing-type";
import { toast } from "sonner";
import { useState } from "react";
import { nftService } from "@/services/nft";

const invalidateMarketQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
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
      fileName: string;
      copyPrice?: string;
      buyPrice?: string;
      maxCopies?: number;
      collectionId?: string;
      contentType?: number;
    }) => {
      const metadata = await createNftMetadataApi(
        data.fileId,
        data.contentType as any,
      );
      const maxCopies = data.maxCopies ?? 100;

      const { tokenId } = await nftService.publishContent({
        metadataURI: metadata.metadataURI,
        contentHash: metadata.contentHash,
        contentType: metadata.contentType,
        contentPrice: data.buyPrice || "0",
        accessPrice: data.copyPrice || "0",
        maxPasses: maxCopies,
        title: metadata.title || data.fileName,
      });

      await listFileApi({
        fileId: data.fileId,
        copyPrice: data.copyPrice,
        buyPrice: data.buyPrice,
        maxCopies,
        tokenId: tokenId.toString(),
        collectionId: data.collectionId,
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
    mutationFn: async (data: {
      fileId: string;
      tokenID: string;
      price: string;
    }) => {
      const result = await nftService.purchaseContent(
        parseInt(data.tokenID, 10),
        data.price.toString(),
      );

      if (result?.receipt?.status === "success") {
        return await buyFileApi(data.fileId);
      }

      throw new Error("Content ownership purchase failed");
    },
    onSuccess: async () => {
      await invalidateMarketQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: ["my-files"] });
      toast.success("Content ownership purchased");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to buy content ownership",
      );
    },
  });

  const buyCopyMutation = useMutation({
    mutationFn: async (data: {
      listingId: string;
      tokenId: string;
      price: string;
      amount?: number;
    }) => {
      const amount = data.amount ?? 1;
      const result = await nftService.purchaseAccess(
        parseInt(data.tokenId, 10),
        amount,
        data.price.toString(),
      );

      if (result?.receipt?.status !== "success") {
        throw new Error("Copy purchase transaction failed");
      }

      // Pass tx hash so backend can record AccessGrant even if AccessToken RPC lag / misconfig.
      await buyCopyApi(data.listingId, amount, result.hash);
      try {
        await syncOwnershipApi();
      } catch {
        // Grant already written by buy-copy; sync is best-effort.
      }
    },
    onSuccess: async () => {
      await invalidateMarketQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: ["my-files"] });
      toast.success("Copy purchased — you can stream/view this content");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to buy copy");
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
    buyCopy: buyCopyMutation.mutateAsync,
    isBuyingCopy: buyCopyMutation.isPending,
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
