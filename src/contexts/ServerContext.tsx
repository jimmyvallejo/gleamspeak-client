import {
  createContext,
  useState,
  ReactNode,
  FC,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

type ServerContextType = {
  serverID: string | null;
  setServerID: Dispatch<SetStateAction<string | null>>;
  serverName: string | null;
  setServerName: Dispatch<SetStateAction<string | null>>;
  serverCode: string | null;
  setServerCode: Dispatch<SetStateAction<string | null>>;
};

export const ServerContext = createContext<ServerContextType | undefined>(
  undefined
);

export const ServerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [serverID, setServerID] = useState<string | null>(null);
  const [serverName, setServerName] = useState<string |null>(null)
  const [serverCode, setServerCode] = useState<string | null>(null)

  useEffect(() => {
    console.log(serverID)
  },[serverID])

  const contextValue: ServerContextType = {
    serverID,
    setServerID,
    serverName,
    setServerName,
    serverCode,
    setServerCode
  };

  return (
    <ServerContext.Provider value={contextValue}>
      {children}
    </ServerContext.Provider>
  );
};
