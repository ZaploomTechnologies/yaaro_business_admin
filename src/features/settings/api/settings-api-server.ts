import "server-only";
import { serverApiClient } from "@/lib/api-client-server";

export const settingsApiServer = {
  getProfile: async (): Promise<{ success: boolean; data: any }> => {
    const response = await serverApiClient.get<any>("/business/profile");
    return response;
  },
};
