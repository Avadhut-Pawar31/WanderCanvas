// Simple authentication service using localStorage for MVP
// In production, replace with proper backend authentication

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'wandercanvas_auth';
const USERS_STORAGE_KEY = 'wandercanvas_users';

export class AuthService {
  // Get current auth state
  static getAuthState(): AuthState {
    if (typeof window === 'undefined') {
      return { user: null, isAuthenticated: false };
    }

    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!authData) {
        return { user: null, isAuthenticated: false };
      }

      const user = JSON.parse(authData) as User;
      return { user, isAuthenticated: true };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  }

  // Login
  static login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not available on server' };
    }

    try {
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      const users: Array<User & { password: string }> = usersData ? JSON.parse(usersData) : [];

      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  // Signup
  static signup(name: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not available on server' };
    }

    try {
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      const users: Array<User & { password: string }> = usersData ? JSON.parse(usersData) : [];

      // Check if user already exists
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'Email already registered' };
      }

      // Create new user
      const newUser: User & { password: string } = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        createdAt: new Date(),
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = newUser;
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  }

  // Logout
  static logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  // Check if authenticated
  static isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }

  // Get current user
  static getCurrentUser(): User | null {
    return this.getAuthState().user;
  }

  // Update user profile
  static updateProfile(updates: Partial<User>): { success: boolean; error?: string } {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not available on server' };
    }

    try {
      const authState = this.getAuthState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Not authenticated' };
      }

      const updatedUser = { ...authState.user, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Update failed' };
    }
  }
}
