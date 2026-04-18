// API Client for backend communication
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100/api").replace(/\/$/, "");

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Get auth token from localStorage (browser) or cookies (server)
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;
      if (token) return token;
    }

    const cookies = document.cookie.split("; ");
    const authTokenCookie = cookies.find((row) => row.startsWith("auth_token="));
    if (authTokenCookie) return authTokenCookie.split("=")[1];
  } catch {
    // Ignore
  }

  return null;
}

function handleAuthFailure() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("auth-storage");
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    window.location.href = "/login";
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, providedToken?: string | null): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = providedToken !== undefined ? providedToken : getAuthToken();

    const headers: Record<string, string> = {
      ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    console.log(`DEBUG: API Request - ${config.method || "GET"} ${url}`);
    console.log("DEBUG: API Request - Auth header present:", !!headers.Authorization);

    const response = await fetch(url, config);

    console.log(`DEBUG: API Response - ${response.status} ${response.statusText}`);

    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") handleAuthFailure();
      throw new Error("Unauthorized access!");
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("DEBUG: API Response is NOT JSON:", text.slice(0, 100));
      throw new Error(`Server returned non-JSON response (${response.status}): ${response.statusText}`);
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || response.statusText);
    }

    // Normalize response: if backend returns flat data, wrap it in ApiResponse envelope
    // This ensures compatibility with the dashboard's expectation of { success, data }
    if (result && typeof result === "object" && "success" in result) {
      return result;
    }

    return {
      success: true,
      data: result,
      message: result.message || undefined
    } as ApiResponse<T>;
  }

  async get<T>(endpoint: string, options?: { params?: any; token?: string | null }): Promise<ApiResponse<T>> {
    const search = options?.params ? `?${new URLSearchParams(options.params).toString()}` : "";
    return this.request<T>(`${endpoint}${search}`, { method: "GET" }, options?.token);
  }

  async post<T>(endpoint: string, data?: any, options?: { headers?: any; token?: string | null }): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers = data instanceof FormData ? options?.headers : { "Content-Type": "application/json", ...options?.headers };
    
    return this.request<T>(endpoint, {
      method: "POST",
      body,
      headers: headers as any,
    }, options?.token);
  }

  async patch<T>(endpoint: string, data?: any, options?: { token?: string | null }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, options?.token);
  }

  async delete<T>(endpoint: string, options?: { token?: string | null }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" }, options?.token);
  }
}

export const apiClient = new ApiClient();
