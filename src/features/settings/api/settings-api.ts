import { apiClient } from "@/lib/api-client";

export const settingsApi = {
  getProfile: () => apiClient.get("/business/profile"),
  
  updateProfile: (data: any) => 
    apiClient.patch("/business/profile", data),
    
  updateLogin: (data: any) => 
    apiClient.patch("/business/login", data),

  uploadImage: (formData: FormData) => 
    apiClient.post<{ url: string }>("/business/uploadImage", formData),
};
