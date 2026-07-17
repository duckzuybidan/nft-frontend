import api from "../api-config";

export interface LeakNftInfo {
  fileId: string;
  name: string;
  previewImage: string | null;
  collection: string | null;
  tokenId: string | null;
}

export interface LeakResult {
  confidence: number;
  integrity: "High" | "Medium" | "Low";
  syncZ: number;
  scale: number;
  angle: number;
  wmId: string;
  code: string;
  sessionId: string;
  page: number;
  viewedAt: string;
  viewerWallet: string;
  nft: LeakNftInfo | null;
}

export interface LeakDetectResponse {
  found: boolean;
  captureType: string;
  results: LeakResult[];
  diagnostics: string[];
}

export const detectWatermarkApi = async (
  file: File,
): Promise<LeakDetectResponse> => {
  const form = new FormData();
  form.append("image", file);
  const res = await api.post<LeakDetectResponse>("/watermark/detect", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
