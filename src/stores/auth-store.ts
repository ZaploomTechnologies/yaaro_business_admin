import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  name: string;
  username: string;
  logo?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (token, user) => set({ isAuthenticated: true, token, user }),
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : state.user })),
      logout: () => {
        // Clear state
        set({ isAuthenticated: false, token: null, user: null });

        // Ensure localStorage is cleared (backup for persist middleware)
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("auth-storage");
            // Also clear auth_token cookie if it exists
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          } catch (error) {
            console.error("Error clearing auth storage:", error);
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
