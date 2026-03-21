import { create } from 'zustand';
import type { AuthState, AuthUser } from './auth.types';

interface AuthActions {
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // App starts in loading state to check silent refresh
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  setAuth: (token, user) =>
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearAuth: () =>
    set({
      ...initialState,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
