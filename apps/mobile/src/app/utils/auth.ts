import { getStoredToken, getStoredUser, clearAuth, loginApi, signupApi, storeAuth, fetchFilters } from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const data = await loginApi(email, password);
      const user: User = {
        id: data.user.email,
        email: data.user.email,
        name: data.user.fullName ?? data.user.username ?? data.user.email,
      };
      return user;
    } catch {
      return null;
    }
  },

  signup: async (name: string, email: string, password: string): Promise<User | null> => {
    try {
      await signupApi({
        username: email,
        email,
        password,
        confirmPassword: password,
        fullName: name,
      });
      return { id: email, email, name };
    } catch {
      return null;
    }
  },

  logout: () => {
    clearAuth();
  },

  getCurrentUser: (): User | null => {
    const stored = getStoredUser();
    if (!stored) return null;
    return { id: stored.email, email: stored.email, name: stored.name };
  },

  isAuthenticated: (): boolean => {
    return !!getStoredToken();
  },

  getToken: (): string | null => {
    return getStoredToken();
  },
};
