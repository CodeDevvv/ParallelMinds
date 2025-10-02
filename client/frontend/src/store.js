import { create } from "zustand";

export const useAuthStore = create((set) => ({
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
    setAuth: () => {
        localStorage.setItem("isAuthenticated", "true");
        set({ isAuthenticated: true });
    },
    clearAuth: () => {
        localStorage.removeItem("isAuthenticated");
        set({ isAuthenticated: false });
    }
}));

export const useLoading = create((set) => {
    return {
        isLoading: false,
        setIsLoading: (bool) => {
            set({ isLoading: bool })
        }
    }
})