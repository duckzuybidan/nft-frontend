import { useMutation } from "@tanstack/react-query";
import { uploadFileApi } from "@/apis/upload";
import { toast } from "sonner";

export const useUpload = () => {
  const uploadFile = useMutation({
    mutationFn: (file: File) => uploadFileApi(file),
    onSuccess: (data) => {
      toast.success("File uploaded successfully");
      console.log("Upload successful:", data);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message;
      toast.error(`Upload failed: ${message}`);
      console.error("Upload failed:", message);
    },
  });

  return {
    uploadFile: uploadFile.mutateAsync,
    isUploading: uploadFile.isPending,
  };
};
