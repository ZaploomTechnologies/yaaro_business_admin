import "server-only";
import { serverApiClient } from "@/lib/api-client-server";
import { Offer, OffersResponse } from "../types/offers";

export const offersApiServer = {
  getAll: async (params: any): Promise<OffersResponse> => {
    const response = await serverApiClient.get<Offer[]>("/business/offers", params);
    return {
      success: response.success,
      data: response.data,
      total: (response as any).total || response.data.length,
    };
  },

  getById: async (id: string): Promise<{ success: boolean; data: Offer }> => {
    const response = await serverApiClient.get<Offer>(`/business/offers/${id}`);
    return response;
  },
};
