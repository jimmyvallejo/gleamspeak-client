import {
  createContext,
  useState,
  ReactNode,
  FC,
  Dispatch,
  SetStateAction,
} from "react";

type ServerContextType = {
  serverID: string | null;
  setServerID: Dispatch<SetStateAction<string | null>>;
  ownerID: string | null;
  setOwnerID: Dispatch<SetStateAction<string | null>>;
  serverName: string | null;
  setServerName: Dispatch<SetStateAction<string | null>>;
  serverCode: string | null;
  setServerCode: Dispatch<SetStateAction<string | null>>;
  serverBanner: string | null;
  setServerBanner: Dispatch<SetStateAction<string | null>>;
};

export const ServerContext = createContext<ServerContextType | undefined>(
  undefined
);

export const ServerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [serverID, setServerID] = useState<string | null>(null);
  const [ownerID, setOwnerID] = useState<string | null>(null)
  const [serverName, setServerName] = useState<string |null>(null)
  const [serverCode, setServerCode] = useState<string | null>(null)
  const [serverBanner, setServerBanner] = useState<string | null>(null)

  const contextValue: ServerContextType = {
    serverID,
    setServerID,
    ownerID,
    setOwnerID,
    serverName,
    setServerName,
    serverCode,
    setServerCode,
    serverBanner,
    setServerBanner
  };

  return (
    <ServerContext.Provider value={contextValue}>
      {children}
    </ServerContext.Provider>
  );
};
