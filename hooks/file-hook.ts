import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyFilesApi,
  updateFileApi,
  deleteFileApi,
  openFileApi,
  openFilePageApi,
  createStreamSessionApi,
  getStreamStatusApi,
  reprocessStreamApi,
  createImageSessionApi,
  getImageTileStatusApi,
  reprocessImageTilesApi,
} from "@/apis/file";
import { FileType } from "@/types/file-type";
import { toast } from "sonner";
import { useState } from "react";

const mapFileItem = (item: any): FileType => ({
  id: item.id,
  cid: item.cid,
  fileName: item.metadata?.fileName || `file-${item.id}`,
  mimeType: item.metadata?.mimeType || "application/octet-stream",
  size: item.metadata?.size ?? 0,
  previewImage: item.metadata?.previewImage ?? null,
  createdAt: item.createdAt,
  userId: item.userId,
  accessType: item.accessType === "copy" ? "copy" : "owned",
  tokenId: item.tokenId ?? null,
  copyBalance: item.copyBalance ?? null,
});

export const useMyFiles = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["my-files", page],
    queryFn: async () => {
      const response = await getMyFilesApi(page, limit, "all");
      const ownedRaw = response.owned?.data ?? response.data ?? [];
      const copiesRaw = response.copies?.data ?? [];
      return {
        owned: ownedRaw.map(mapFileItem),
        copies: copiesRaw.map(mapFileItem),
        ownedTotal: response.owned?.total ?? response.total ?? ownedRaw.length,
        copiesTotal: response.copies?.total ?? copiesRaw.length,
        page: response.page || page,
        totalPages: Math.max(
          response.owned?.totalPages ?? response.totalPages ?? 1,
          response.copies?.totalPages ?? 1,
        ),
      };
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: ({ fileId, fileName }: { fileId: string; fileName: string }) =>
      updateFileApi(fileId, { fileName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-files"] });
      toast.success("File renamed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to rename file");
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => deleteFileApi(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-files"] });
      toast.success("File deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete file");
    },
  });

  return {
    ownedFiles: data?.owned || [],
    copyFiles: data?.copies || [],
    files: data?.owned || [],
    isLoading,
    isFetching,
    pagination: {
      page: data?.page || 1,
      totalPages: data?.totalPages || 1,
      total: (data?.ownedTotal || 0) + (data?.copiesTotal || 0),
      ownedTotal: data?.ownedTotal || 0,
      copiesTotal: data?.copiesTotal || 0,
      setPage,
    },
    updateFile: updateFileMutation.mutateAsync,
    isUpdating: updateFileMutation.isPending,
    deleteFile: deleteFileMutation.mutateAsync,
    isDeleting: deleteFileMutation.isPending,
  };
};

export const useStreamStatus = (fileId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["stream-status", fileId],
    queryFn: () => getStreamStatusApi(fileId),
    enabled: enabled && Boolean(fileId),
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 3000 : false,
  });
};

export const useImageTileStatus = (fileId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["image-tile-status", fileId],
    queryFn: () => getImageTileStatusApi(fileId),
    enabled: enabled && Boolean(fileId),
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 3000 : false,
  });
};

export const useFileViewer = () => {
  const openFilePageMutation = useMutation({
    mutationFn: async ({ fileId, page }: { fileId: string; page: number }) => {
      return await openFilePageApi(fileId, page);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to load file page");
    },
  });

  const createStreamSessionMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await createStreamSessionApi(fileId);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to start playback session",
      );
    },
  });

  const reprocessStreamMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await reprocessStreamApi(fileId);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to reprocess stream",
      );
    },
  });

  const createImageSessionMutation = useMutation({
    mutationFn: async ({
      fileId,
      page,
    }: {
      fileId: string;
      page?: number;
    }) => {
      return await createImageSessionApi(fileId, page);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to start image viewing session",
      );
    },
  });

  const reprocessImageTilesMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await reprocessImageTilesApi(fileId);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to reprocess image tiles",
      );
    },
  });

  return {
    openFilePage: openFilePageMutation.mutateAsync,
    isLoadingPage: openFilePageMutation.isPending,
    createStreamSession: createStreamSessionMutation.mutateAsync,
    isCreatingStreamSession: createStreamSessionMutation.isPending,
    reprocessStream: reprocessStreamMutation.mutateAsync,
    isReprocessingStream: reprocessStreamMutation.isPending,
    createImageSession: createImageSessionMutation.mutateAsync,
    isCreatingImageSession: createImageSessionMutation.isPending,
    reprocessImageTiles: reprocessImageTilesMutation.mutateAsync,
    isReprocessingImageTiles: reprocessImageTilesMutation.isPending,
  };
};
