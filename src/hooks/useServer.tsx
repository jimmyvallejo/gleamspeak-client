import { useContext } from "react";
import { ServerContext } from "../contexts/ServerContext";

export const useServer = () => {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
