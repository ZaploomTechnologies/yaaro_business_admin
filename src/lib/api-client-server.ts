import "server-only";
// Server-side API client wrapper
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiClient } from "./api-client";

async function getServerAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authTokenCookie = cookieStore.get("auth_token");
    return authTokenCookie?.value ?? null;
  } catch {
    return null;
  }
}

async function withAuth<T>(fn: (token: string | null) => Promise<T>): Promise<T> {
  const token = await getServerAuthToken();
  if (!token) redirect("/login");
  try {
    return await fn(token);
  } catch (error: any) {
    if (error.message === "Unauthorized access!") redirect("/api/auth/logout");
    throw error;
  }
}

export const serverApiClient = {
  get<T>(endpoint: string, params?: any) {
    return withAuth((token) => apiClient.get<T>(endpoint, { params, token }));
  },

  post<T>(endpoint: string, data?: any) {
    return withAuth((token) => apiClient.post<T>(endpoint, data, { token }));
  },

  patch<T>(endpoint: string, data?: any) {
    return withAuth((token) => apiClient.patch<T>(endpoint, data, { token }));
  },

  delete<T>(endpoint: string) {
    return withAuth((token) => apiClient.delete<T>(endpoint, { token }));
  },
};
