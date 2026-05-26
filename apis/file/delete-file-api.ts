import api from "../api-config";

export const deleteFileApi = async (fileId: string) => {
  const response = await api.delete(`/file/${fileId}`);
  return response.data;
};
