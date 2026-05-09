import { createContext, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser
} from "../api/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const loadCurrentUser = async () => {
    try {
      const response = await fetchCurrentUser();
      setUser(response.user);
      return response.user;
    } catch (error) {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      await loadCurrentUser();
      setIsBootstrapping(false);
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      async signup(formData) {
        const response = await registerUser(formData);
        setUser(response.user);
        return response;
      },
      async login(formData) {
        const response = await loginUser(formData);
        setUser(response.user);
        return response;
      },
      async logout() {
        await logoutUser();
        setUser(null);
      },
      refreshUser: loadCurrentUser
    }),
    [isBootstrapping, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
