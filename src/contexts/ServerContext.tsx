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
import { Server } from "../components/global/navbars/Servers";


type ServerContextType = {
  server: Server | null;
  setServer:Dispatch<SetStateAction<Server | null>>;
};

export const ServerContext = createContext<ServerContextType | undefined>(
  undefined
);

export const ServerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [server, setServer] = useState<Server | null>(null)

  const auth = useContext(AuthContext)
  const ws = useWebSocket()

  useEffect(() => {
    if(!auth?.isAuthenticated){
      setServer(null)
    }
  },[auth?.isAuthenticated])

  useEffect(() => {
    ws.changeServer(server?.server_id)
  },[server?.server_id])

  const contextValue: ServerContextType = {
    server,
    setServer
  };

  return (
    <ServerContext.Provider value={contextValue}>
      {children}
    </ServerContext.Provider>
  );
};
