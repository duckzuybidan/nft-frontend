import api from "../api-config";

export type UpdateFileRequest = {
  fileName: string;
};

export const updateFileApi = async (fileId: string, payload: UpdateFileRequest) => {
  const response = await api.patch(`/file/${fileId}`, payload);
  return response.data;
};
