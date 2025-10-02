import { create } from 'zustand';

export const useAuthStore = create((set) => {
    const token =
        typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

    const storedAdminData = typeof window !== 'undefined' ? localStorage.getItem('adminData') : null;
    const adminData = JSON.parse(storedAdminData) 

    return {
        token,
        isAuthenticated: Boolean(token),
        adminData,
        setAdminData: (data) => {
            localStorage.setItem('adminData', JSON.stringify(data));
            set({ adminData: data });
        },
        setAuth: (newToken) => {
            localStorage.setItem('token', newToken);
            set({ token: newToken, isAuthenticated: true });
        },
        clearAuth: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('adminData')
            set({ token: null, isAuthenticated: false });
        },
    };
});

export const useLoading = create((set) => {
    return {
        isLoading: false,
        setIsLoading: (bool) => {
            set({ isLoading: bool })
        }
    }
})

