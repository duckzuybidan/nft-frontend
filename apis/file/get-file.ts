import api from "../api-config";

export interface FileMetadata {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  previewImage: string | null;
}

export const getFile = async (fileId: string): Promise<FileMetadata> => {
  const response = await api.get(`/file/${fileId}/metadata`);
  return response.data;
};
