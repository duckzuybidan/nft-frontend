import api from "../api-config";
import { ListingType } from "@/types/listing-type";

const getListingApi = async (id: string): Promise<ListingType> => {
  const response = await api.get(`/market/listing/${id}`);
  return response.data;
};

export { getListingApi };