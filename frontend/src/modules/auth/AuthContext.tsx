import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_URL } from "../../config/api";

export type EmployeeRole = "ADMIN" | "RECEPTION" | "DOCTOR";
export type AuthUser = {
  _id: string;
  username: string;
  name: string;
  role: EmployeeRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authError: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const readUserResponse = async (response: Response) => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Authentication request failed.");
  }
  const body: { user: AuthUser } = await response.json();
  return body.user;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then(async (response) => {
        if (response.status === 401) return null;
        return readUserResponse(response);
      })
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setAuthError("Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setUser(await readUserResponse(response));
    setAuthError(null);
  }, []);

  const logout = useCallback(async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Unable to end the current session.");
    }
    setUser(null);
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};
