import { createContext, useState, useEffect, ReactNode, FC } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

type AuthContextType = {
  isAuthenticated: boolean;
  user: string | null;
  loginStandard: (email: string, password: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const api = useApi()

  const navigate = useNavigate();

  const loginStandard = async (email: string, password: string): Promise<void> => {
    const data = {
      email: email,
      password: password,
    };
  
    try {
      const response = await api.post(`/v1/login`, data);
      if (response.status === 200) {
        await checkAuthStatus();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await api.get(`/v1/auth`);
      if (response.status === 200) {
        setIsAuthenticated(true);
        setUser(response.data);
      }
    } catch (error) {
      console.log(error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };
  const logout = () => {
    api.post(`/v1/logout`);
    navigate("/login");
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    console.log(user)
    console.log(isAuthenticated)
  },[user])

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    loginStandard,
    checkAuthStatus,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
