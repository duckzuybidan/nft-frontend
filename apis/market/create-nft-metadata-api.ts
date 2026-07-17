import api from "../api-config";
import type { ContentType } from "@/services/ContentNFT";

export interface NftMetadataResponse {
  metadataURI: string;
  metadataCid: string;
  contentHash: `0x${string}`;
  contentType: ContentType;
  suggestedContentType?: ContentType;
  title: string;
  mimeType: string;
  previewImage?: string;
}

export const createNftMetadataApi = async (
  fileId: string,
  contentType?: ContentType,
): Promise<NftMetadataResponse> => {
  const response = await api.post<NftMetadataResponse>(
    `/market/metadata/${fileId}`,
    contentType !== undefined ? { contentType } : {},
  );
  return response.data;
};
