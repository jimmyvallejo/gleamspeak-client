import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  FC,
  Dispatch,
  SetStateAction,
} from "react";
import { AuthContext } from "./AuthContext";
import { useWebSocket } from "../hooks/useWebsocket";


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

  const auth = useContext(AuthContext)
  const ws = useWebSocket()

  useEffect(() => {
    if(!auth?.isAuthenticated){
      setServerID(null)
      setOwnerID(null)
      setServerName(null)
      setServerCode(null)
      setServerBanner(null)
    }
  },[auth?.isAuthenticated])

  useEffect(() => {
    ws.changeServer(serverID)
  },[serverID])

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
