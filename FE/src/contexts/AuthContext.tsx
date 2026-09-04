import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { api, type AdminUser } from "../utils/api";

interface AuthContextType {
  admin: AdminUser | null;

  loading: boolean;

  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const result = await api.auth.me();

      setAdmin(result);
    } catch {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAdmin(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshAuth]);

  const login = async (username: string, password: string) => {
    const result = await api.auth.login({
      username,
      password,
    });

    setAdmin(result.admin);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,

        isAuthenticated: Boolean(admin),

        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }

  return context;
}
