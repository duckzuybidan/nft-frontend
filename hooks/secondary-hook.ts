"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buySecondaryListingApi,
  cancelSecondaryListingApi,
  createSecondaryListingApi,
  getMySecondaryApi,
  listSecondaryApi,
} from "@/apis/market/secondary-api";
import { nftService } from "@/services/nft";
import { toast } from "sonner";
import { syncOwnershipApi } from "@/apis/auth";

export function useSecondaryMarket(page = 1) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["secondary-market", page],
    queryFn: () => listSecondaryApi(page, 12),
  });

  const buyMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      onChainListingId: string;
      amount: number;
      pricePerPass: string;
    }) => {
      const result = await nftService.buySecondaryAccess(
        parseInt(data.onChainListingId, 10),
        data.amount,
        data.pricePerPass,
      );
      if (result?.receipt?.status !== "success") {
        throw new Error("Secondary purchase failed");
      }
      await buySecondaryListingApi(data.id, data.amount, result.hash);
      try {
        await syncOwnershipApi();
      } catch {
        /* best effort */
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["secondary-market"] });
      await queryClient.invalidateQueries({ queryKey: ["my-files"] });
      toast.success("Copy purchased on secondary market");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to buy copy",
      );
    },
  });

  return {
    listings: listQuery.data?.data || [],
    pagination: {
      page: listQuery.data?.page || 1,
      totalPages: listQuery.data?.totalPages || 1,
      total: listQuery.data?.total || 0,
    },
    isLoading: listQuery.isLoading,
    buy: buyMutation.mutateAsync,
    isBuying: buyMutation.isPending,
  };
}

export function useMySecondary() {
  const queryClient = useQueryClient();

  const mineQuery = useQuery({
    queryKey: ["my-secondary"],
    queryFn: getMySecondaryApi,
  });

  const listMutation = useMutation({
    mutationFn: async (data: {
      fileId: string;
      tokenId: string;
      amount: number;
      pricePerPass: string;
    }) => {
      const result = await nftService.listCopyForSale(
        parseInt(data.tokenId, 10),
        data.amount,
        data.pricePerPass,
      );
      if (result?.receipt?.status !== "success") {
        throw new Error("listForSale failed");
      }
      await createSecondaryListingApi({
        fileId: data.fileId,
        tokenId: data.tokenId,
        onChainListingId: result.listingId.toString(),
        amount: data.amount,
        pricePerPass: Number(data.pricePerPass),
        txHash: result.hash,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-secondary"] });
      await queryClient.invalidateQueries({ queryKey: ["secondary-market"] });
      toast.success("Copy listed on secondary market");
    },
    onError: (error: any) => {
      toast.error(
        error?.shortMessage ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to list copy",
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (data: { id: string; onChainListingId: string }) => {
      const result = await nftService.cancelSecondaryListing(
        parseInt(data.onChainListingId, 10),
      );
      await cancelSecondaryListingApi(data.id, result.hash);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-secondary"] });
      await queryClient.invalidateQueries({ queryKey: ["secondary-market"] });
      toast.success("Listing cancelled");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to cancel listing",
      );
    },
  });

  return {
    active: mineQuery.data?.active || [],
    sold: mineQuery.data?.sold || [],
    purchases: mineQuery.data?.purchases || [],
    isLoading: mineQuery.isLoading,
    listCopy: listMutation.mutateAsync,
    isListing: listMutation.isPending,
    cancel: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
}
