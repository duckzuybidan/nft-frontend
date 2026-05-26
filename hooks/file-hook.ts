import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyFilesApi, updateFileApi, deleteFileApi } from "@/apis/file";
import { FileType } from "@/types/file-type";
import { toast } from "sonner";

export const useMyFiles = () => {
  const { data, isLoading } = useQuery<FileType[]>({
    queryKey: ["my-files"],
    queryFn: async (): Promise<FileType[]> => {
      const response = await getMyFilesApi();
      return response.map((item) => ({
        id: item.id,
        cid: item.cid,
        fileName: item.metadata.fileName,
        mimeType: item.metadata.mimeType,
        size: item.metadata.size,
        previewImage: item.metadata.previewImage,
        createdAt: item.createdAt,
        userId: item.userId,
      }));
    },
  });

  return {
    files: data || [],
    isLoading,
  };
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      fileName,
    }: {
      fileId: string;
      fileName: string;
    }) => updateFileApi(fileId, { fileName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-files"] });
      toast.success("File renamed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to rename file");
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteFileApi(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-files"] });
      toast.success("File deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete file");
    },
  });
};
