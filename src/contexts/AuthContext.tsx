import { createContext, useState, useEffect, ReactNode, FC } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

export type user = {
  id: string;
  handle: string;
  email: string;
  avatar: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: user | null;
  loginStandard: (email: string, password: string) => Promise<void>;
  createStandard: (
    email: string,
    handle: string,
    password: string
  ) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  logout: () => void;
  leaveCurrentVoiceChannel: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<user | null>(null);

  const api = useApi();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const loginStandard = async (
    email: string,
    password: string
  ): Promise<void> => {
    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await api.post(`/v1/login`, data);
      if (response.status === 200) {
        await checkAuthStatus();
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const createStandard = async (
    email: string,
    handle: string,
    password: string
  ): Promise<void> => {
    const data = { email, handle, password };

    try {
      const response = await api.post(`/v1/users`, data);
      if (response.status === 201) {
        await loginStandard(email, password);
      } else {
        throw new Error("User creation failed");
      }
    } catch (error) {
      console.error("User creation error:", error);
      throw error;
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

  const leaveCurrentVoiceChannel = async () => {
    try {
      await api.delete(`/v1/channels/voice/${user?.id}`);
    } catch (error) {
      console.error(error);
    }
  };
  
  const logout = async () => {
    try {
      await leaveCurrentVoiceChannel();
      await api.post(`/v1/logout`);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      navigate("/auth");
      setIsAuthenticated(false);
      setUser(null);
      queryClient.clear();
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (isAuthenticated) {
        event.preventDefault();
        await leaveCurrentVoiceChannel();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    loginStandard,
    createStandard,
    checkAuthStatus,
    logout,
    leaveCurrentVoiceChannel
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
