import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyFilesApi,
  updateFileApi,
  deleteFileApi,
  openFileApi,
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

  const openFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      mimeType,
    }: {
      fileId: string;
      mimeType?: string;
    }) => {
      toast.loading("Opening file...", { id: "open-file" });
      const blob = await openFileApi(fileId);
      if (mimeType) {
        return new Blob([blob], { type: mimeType });
      }
      return blob;
    },
    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("File opened", { id: "open-file" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to open file", {
        id: "open-file",
      });
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
    openFile: openFileMutation.mutateAsync,
    isOpening: openFileMutation.isPending,
  };
};
