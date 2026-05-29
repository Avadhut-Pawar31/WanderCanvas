import { create } from 'zustand';
import { User, AuthService } from '@/lib/auth';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
  updateProfile: (updates: Partial<User>) => { success: boolean; error?: string };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (email: string, password: string) => {
    const result = AuthService.login(email, password);
    
    if (result.success && result.user) {
      set({ user: result.user, isAuthenticated: true });
    }
    
    return result;
  },
  
  signup: async (name: string, email: string, password: string) => {
    const result = AuthService.signup(name, email, password);
    
    if (result.success && result.user) {
      set({ user: result.user, isAuthenticated: true });
    }
    
    return result;
  },
  
  logout: () => {
    AuthService.logout();
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: () => {
    const authState = AuthService.getAuthState();
    set({ 
      user: authState.user, 
      isAuthenticated: authState.isAuthenticated,
      isLoading: false 
    });
  },
  
  updateProfile: (updates: Partial<User>) => {
    const result = AuthService.updateProfile(updates);
    
    if (result.success) {
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      }));
    }
    
    return result;
  },
}));
