import {
  createContext,
  useState,
  ReactNode,
  FC,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";

import {
  Event,
  SendMessageEvent,
  ChangeChatRoomEvent,
} from "./WebSocketEvents";

interface EventPayload {
  [key: string]: any;
}

type WebSocketContextType = {
  connected: boolean;
  setConnected: Dispatch<SetStateAction<boolean>>;
  textRoom: string | null;
  setTextRoom: Dispatch<SetStateAction<string | null>>;
  changeChatRoom(): void;
  sendMessage: (
    user: string | null | undefined,
    handle: string | null | undefined,
    message: string | null,
    image: string,
    avatar: string | null,
  ) => void;
  channelMessages: any[];
  setChannelMessages: Dispatch<SetStateAction<any[] | []>>;
};

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const auth = useContext(AuthContext);
  const [connected, setConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [textRoom, setTextRoom] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [channelMessages, setChannelMessages] = useState<any[]>([]);

  const connectWebSocket = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    setConnectionError(null);
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      setConnectionError(null);
    };

    ws.onmessage = (evt) => {
      try {
        const eventData = JSON.parse(evt.data);
        console.log("Received message:", eventData);
        routeEvent(eventData);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.reason);
      setConnected(false);
      setConnectionError(
        `Connection closed: ${event.reason || "Unknown reason"}`
      );
      if (auth?.user) {
        setTimeout(connectWebSocket, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionError(
        "Failed to connect to WebSocket server. Please check your network connection and server status."
      );
    };

    setSocket(ws);
  }, [auth?.user]);

  useEffect(() => {
    if (auth?.user) {
      connectWebSocket();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
        setChannelMessages([]);
      }
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [auth?.user, connectWebSocket]);

  const routeEvent = (event: Event<EventPayload>) => {
    if (event.type === undefined) {
      console.error("No type field in the event");
      return;
    }

    console.log(event);

    switch (event.type) {
      case "new_message":
        handleNewMessage(event.payload);
        break;
      case "change_chat_room":
        handleChangeChatRoom(event.payload);
        setChannelMessages([]);
        break;
      default:
        console.warn("Unsupported message type:", event.type);
        break;
    }
  };

  const handleNewMessage = (payload: EventPayload) => {
    console.log("New message:", payload);
    setChannelMessages((prevMessages) => [...prevMessages, payload]);
  };

  function handleChangeChatRoom(payload: EventPayload) {
    console.log("Changed chat room:", payload);
  }

  const sendEvent = (eventName: string, payload: EventPayload) => {
    if (socket && connected) {
      const event = new Event(eventName, payload);
      socket.send(JSON.stringify(event));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  const sendMessage = (
    user: string | null | undefined,
    handle: string | null | undefined,
    message: string | null,
    image: string,
    avatar: string | null
  ) => {
    if (socket && connected) {
      const outgoingEvent = new SendMessageEvent(
        message,
        user,
        handle,
        textRoom,
        image,
        avatar
      );
      if (textRoom) {
        sendEvent("send_message", outgoingEvent);
      }
    } else {
      console.error("WebSocket is not connected or invalid user/message");
    }
  };

  const changeChatRoom = () => {
    if (textRoom != null) {
      const changeEvent = new ChangeChatRoomEvent(textRoom);
      sendEvent("change_room", changeEvent);
    }
  };

  useEffect(() => {
    changeChatRoom();
  }, [textRoom]);

  useEffect(() => {
    if (connectionError) {
      console.log(connectionError);
    }
  }, [connectionError]);

  const contextValue: WebSocketContextType = {
    connected,
    setConnected,
    sendMessage,
    textRoom,
    setTextRoom,
    changeChatRoom,
    channelMessages,
    setChannelMessages,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
