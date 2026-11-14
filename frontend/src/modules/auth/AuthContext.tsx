import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type AuthUser = { username: string; role?: string };
type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string) => void;
  logout: () => void;
};

const STORAGE_KEY = "estrella-demo-user";
const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const username = sessionStorage.getItem(STORAGE_KEY);
    return username ? { username } : null;
  });

  const login = (username: string) => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      throw new Error("Нэвтрэх нэр хоосон байж болохгүй.");
    }

    sessionStorage.setItem(STORAGE_KEY, normalizedUsername);
    setUser({ username: normalizedUsername });
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
