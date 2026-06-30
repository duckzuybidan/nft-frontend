import api from "../api-config";
import { ListingType } from "@/types/listing-type";

const buyFileApi = async (listingId: string): Promise<ListingType> => {
  const response = await api.post(`/market/listing/${listingId}/buy`);
  return response.data;
};

export { buyFileApi };
