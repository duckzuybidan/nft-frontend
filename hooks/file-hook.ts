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
} from "@/apis/file";
import { FileType } from "@/types/file-type";
import { PaginatedResponse } from "@/types/paginated-response";
import { toast } from "sonner";
import { useState } from "react";

export const useMyFiles = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<FileType>>(
    {
      queryKey: ["my-files", page],
      queryFn: async (): Promise<PaginatedResponse<FileType>> => {
        const response = await getMyFilesApi(page, limit);
        return {
          ...response,
          data: response.data.map((item) => ({
            id: item.id,
            cid: item.cid,
            fileName: item.metadata.fileName,
            mimeType: item.metadata.mimeType,
            size: item.metadata.size,
            previewImage: item.metadata.previewImage,
            createdAt: item.createdAt,
            userId: item.userId,
          })),
        };
      },
    },
  );

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
    files: data?.data || [],
    isLoading,
    isFetching,
    pagination: {
      page: data?.page || 1,
      totalPages: data?.totalPages || 1,
      total: data?.total || 0,
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

  return {
    openFilePage: openFilePageMutation.mutateAsync,
    isLoadingPage: openFilePageMutation.isPending,
    createStreamSession: createStreamSessionMutation.mutateAsync,
    isCreatingStreamSession: createStreamSessionMutation.isPending,
    reprocessStream: reprocessStreamMutation.mutateAsync,
    isReprocessingStream: reprocessStreamMutation.isPending,
  };
};
