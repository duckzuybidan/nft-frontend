import api from "../api-config";

export interface ImageWatermarkInfo {
  /** Forensic watermark id embedded invisibly server-side (WM-XXXXXX). */
  wmId: string | null;
  invisible: boolean;
  sessionId: string;
  page: number;
  issuedAt: string;
  expiresAt: string;
}

export interface ImageSessionResponse {
  sessionId: string;
  streamToken: string;
  expiresAt: string;
  expiresIn: number;
  fileId: string;
  page: number;
  totalPages: number;
  manifestUrl: string;
  tileUrlTemplate: string;
  /** Ephemeral AES-128-CBC key (base64) for client-side tile decryption. */
  tileKey: string;
  tileCipher: string;
  tileFormat: string;
  mimeType: string;
  watermark: ImageWatermarkInfo;
}

export interface ImageTileStatusResponse {
  fileId: string;
  status: "processing" | "ready" | "failed" | "unavailable";
  width?: number;
  height?: number;
  tileSize?: number;
  maxLevel?: number;
  totalPages?: number;
  readyPages?: number;
  page?: number;
  updatedAt?: string;
}

export interface ImageManifest {
  fileId: string;
  sessionId: string;
  width: number;
  height: number;
  tileSize: number;
  maxLevel: number;
  levels: Array<{
    level: number;
    width: number;
    height: number;
    cols: number;
    rows: number;
  }>;
  tileFormat: string;
}

export const createImageSessionApi = async (
  tokenOrFileId: string,
  page?: number,
): Promise<ImageSessionResponse> => {
  const response = await api.post<ImageSessionResponse>(
    `/image/session/${tokenOrFileId}`,
    undefined,
    { params: page && page > 0 ? { page } : undefined },
  );
  return response.data;
};

export const getImageTileStatusApi = async (
  tokenOrFileId: string,
): Promise<ImageTileStatusResponse> => {
  const response = await api.get<ImageTileStatusResponse>(
    `/image/status/${tokenOrFileId}`,
  );
  return response.data;
};

export const reprocessImageTilesApi = async (
  tokenOrFileId: string,
): Promise<ImageTileStatusResponse> => {
  const response = await api.post<ImageTileStatusResponse>(
    `/image/reprocess/${tokenOrFileId}`,
  );
  return response.data;
};

export const fetchImageManifestApi = async (
  manifestUrl: string,
): Promise<ImageManifest> => {
  const response = await api.get<ImageManifest>(manifestUrl);
  return response.data;
};

/** Tiles arrive encrypted: IV (16 bytes) + AES-128-CBC ciphertext. */
export const fetchEncryptedTileApi = async (
  tileUrl: string,
): Promise<ArrayBuffer> => {
  const response = await api.get(tileUrl, { responseType: "arraybuffer" });
  return response.data as ArrayBuffer;
};
