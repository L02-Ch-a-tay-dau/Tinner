export interface User {
  id: string;
  email: string;
  name: string;
}

const AUTH_KEY = "foodswipe_user";

export const authService = {
  login: (email: string, password: string): User | null => {
    // Mock authentication - in production, this would call your backend
    const users = JSON.parse(localStorage.getItem("foodswipe_users") || "[]");
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const authUser = { id: user.id, email: user.email, name: user.name };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
      return authUser;
    }
    return null;
  },

  loginAsGuest: (): User => {
    const guestUser = {
      id: "guest-" + crypto.randomUUID(),
      email: "guest@tinner.app",
      name: "Guest",
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(guestUser));
    return guestUser;
  },

  signup: (name: string, email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem("foodswipe_users") || "[]");
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      return null;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In production, this should be hashed
    };

    users.push(newUser);
    localStorage.setItem("foodswipe_users", JSON.stringify(users));

    const authUser = { id: newUser.id, email: newUser.email, name: newUser.name };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    return authUser;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_KEY);
  },
};
