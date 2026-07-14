import api from "../api-config";

export interface StreamSessionResponse {
  sessionId: string;
  streamToken: string;
  expiresAt: string;
  expiresIn: number;
  fileId: string;
  manifestUrl: string;
  mimeType: string;
}

export interface StreamStatusResponse {
  fileId: string;
  status: "processing" | "ready" | "failed" | "unavailable";
  duration?: number;
  updatedAt?: string;
}

export const createStreamSessionApi = async (
  tokenOrFileId: string,
): Promise<StreamSessionResponse> => {
  const response = await api.post<StreamSessionResponse>(
    `/stream/session/${tokenOrFileId}`,
  );
  return response.data;
};

export const getStreamStatusApi = async (
  tokenOrFileId: string,
): Promise<StreamStatusResponse> => {
  const response = await api.get<StreamStatusResponse>(
    `/stream/status/${tokenOrFileId}`,
  );
  return response.data;
};

export const reprocessStreamApi = async (
  tokenOrFileId: string,
): Promise<StreamStatusResponse> => {
  const response = await api.post<StreamStatusResponse>(
    `/stream/reprocess/${tokenOrFileId}`,
  );
  return response.data;
};
