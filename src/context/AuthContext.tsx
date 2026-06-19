import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("jtg_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.get("/api/auth/me").then(res => {
        setUser(res.data.user);
        setLoading(false);
      }).catch(() => {
        setToken(null);
        localStorage.removeItem("jtg_token");
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (token: string, user: any) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("jtg_token", token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("jtg_token");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
