import { apiClient } from "@/lib/api-client";
import { Offer, OffersResponse } from "../types/offers";

export const offersApi = {
  getAll: async (params: any): Promise<OffersResponse> => {
    const response = await apiClient.get<Offer[]>("/business/offers", params);
    // Backend returns { success: true, data: [...], total: ... }
    return {
      success: response.success,
      data: response.data,
      total: (response as any).total || response.data.length,
    };
  },

  getCategories: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get<any[]>("/business/categories");
    return response;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Offer }> => {
    const response = await apiClient.get<Offer>(`/business/offers/${id}`);
    return response;
  },

  create: async (data: Partial<Offer>): Promise<{ success: boolean; data: Offer }> => {
    const response = await apiClient.post<Offer>("/business/offers", data);
    return response;
  },

  update: async (id: string, data: Partial<Offer>): Promise<{ success: boolean; data: Offer }> => {
    const response = await apiClient.patch<Offer>(`/business/offers/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/business/offers/${id}`);
    return { success: response.success };
  },

  uploadImage: async (formData: FormData): Promise<{ success: boolean; data: { url: string } }> => {
    const response = await apiClient.post<{ url: string }>("/business/uploadImage", formData);
    return response;
  },
};
