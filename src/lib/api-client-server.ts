import "server-only";
// Server-side API client wrapper
import { cookies } from "next/headers";
import { apiClient } from "./api-client";

/**
 * Get auth token from cookies (server-side only)
 */
async function getServerAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authTokenCookie = cookieStore.get("auth_token");
    if (authTokenCookie?.value) {
      console.log("DEBUG: Server Auth - Token found in cookies (last 5 chars):", authTokenCookie.value.slice(-5));
      return authTokenCookie.value;
    }
    console.log("DEBUG: Server Auth - Token NOT found in cookies");
    return null;
  } catch (error: any) {
    console.log("DEBUG: Server Auth - Error reading cookies:", error.message);
    return null;
  }
}

/**
 * Server-side API client wrapper
 * Automatically gets token from cookies and passes it to API client
 */
export const serverApiClient = {
  async get<T>(endpoint: string, params?: any) {
    const token = await getServerAuthToken();
    return apiClient.get<T>(endpoint, { params, token });
  },

  async post<T>(endpoint: string, data?: any) {
    const token = await getServerAuthToken();
    return apiClient.post<T>(endpoint, data, { token });
  },

  async patch<T>(endpoint: string, data?: any) {
    const token = await getServerAuthToken();
    return apiClient.patch<T>(endpoint, data, { token });
  },

  async delete<T>(endpoint: string) {
    const token = await getServerAuthToken();
    return apiClient.delete<T>(endpoint, { token });
  },
};
