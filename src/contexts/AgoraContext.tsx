import { createContext, ReactNode, FC } from "react";


type AgoraContextType = {

};

export const AuthContext = createContext<AgoraContextType | null>(null);

export const AgoraProvider: FC<{ children: ReactNode }> = ({ children }) => {
  
  const contextValue: AgoraContextType = {

  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
