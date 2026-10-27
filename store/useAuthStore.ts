import { create } from 'zustand';
import { User, AuthService } from '@/lib/auth';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Listen for Supabase session changes automatically
  if (typeof window !== 'undefined') {
    AuthService.subscribeToAuthChanges((user) => {
      set({
        user,
        isAuthenticated: Boolean(user),
        isLoading: false,
      });
    });
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      const result = await AuthService.login(email, password);

      if (result.success && result.user) {
        set({ user: result.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }

      return result;
    },

    signup: async (name: string, email: string, password: string) => {
      set({ isLoading: true });
      const result = await AuthService.signup(name, email, password);

      if (result.success && result.user && !result.emailConfirmationRequired) {
        set({ user: result.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }

      return result;
    },

    logout: async () => {
      await AuthService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    },

    checkAuth: async () => {
      // 1. Instant check from local cache to prevent UI flash
      const cached = AuthService.getAuthState();
      if (cached.isAuthenticated && cached.user) {
        set({
          user: cached.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      // 2. Validate current session with Supabase Auth service
      const verifiedUser = await AuthService.getCurrentUserAsync();
      set({
        user: verifiedUser,
        isAuthenticated: Boolean(verifiedUser),
        isLoading: false,
      });
    },

    updateProfile: async (updates: Partial<User>) => {
      const result = await AuthService.updateProfile(updates);

      if (result.success) {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      }

      return result;
    },
  };
});
