import api from "../api-config";

type GetUserFilesRequest = {
  userId: string;
};

type FileResponse = {
  id: string;
  cid: string;
  createdAt: string;
  userId: string;
  metadata: {
    id: string;
    fileId: string;
    fileName: string;
    mimeType: string;
    size: number;
    previewImage: string | null;
    createdAt: string;
  };
};

export const getUserFilesApi = async (
  payload: GetUserFilesRequest,
): Promise<FileResponse[]> => {
  const response = await api.get("/file/by-user-id", { params: payload });
  return response.data;
};

export const getMyFilesApi = async (): Promise<FileResponse[]> => {
  const response = await api.get("/file/my-files");
  return response.data;
};
