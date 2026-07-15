import api from "../api-config";
import type { ContentType } from "@/services/ContentNFT";

export interface NftMetadataResponse {
  metadataURI: string;
  metadataCid: string;
  contentHash: `0x${string}`;
  contentType: ContentType;
  title: string;
  mimeType: string;
  previewImage?: string;
}

export const createNftMetadataApi = async (
  fileId: string,
): Promise<NftMetadataResponse> => {
  const response = await api.post<NftMetadataResponse>(
    `/market/metadata/${fileId}`,
  );
  return response.data;
};
