import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";
import {
  Event,
  SendMessageEvent,
  ChangeChatRoomEvent,
  ChangeVoiceRoomEvent,
  AddVoiceMemberEvent,
} from "./WebSocketEvents";
import { Channel } from "../components/global/navbars/Channels";
// Types and Interfaces
interface EventPayload {
  [key: string]: any;
}

type WebSocketContextType = {
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  textRoom: string | null;
  voiceRoom: string | null | undefined;
  setTextRoom: React.Dispatch<React.SetStateAction<string | null>>;
  setVoiceRoom: React.Dispatch<React.SetStateAction<string | null>>;
  changeChatRoom(): void;
  changeVoiceRoom(server: string | null | undefined, channel: string): void;
  sendMessage: (
    user: string | null | undefined,
    handle: string | null | undefined,
    message: string | null,
    image: string,
    avatar: string | null
  ) => void;
  voiceChannels: any[];
  channelMessages: any[];
  setChannelMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setVoiceChannels: React.Dispatch<React.SetStateAction<any[]>>;
};

// Context Creation
export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

// WebSocket Provider Component
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = useContext(AuthContext);
  const [connected, setConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [textRoom, setTextRoom] = useState<string | null>(null);
  const [voiceRoom, setVoiceRoom] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [channelMessages, setChannelMessages] = useState<any[]>([]);
  const [voiceChannels, setVoiceChannels] = useState<Channel[]>([]);

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
        setChannelMessages([]);
        break;
      case "added_voice_member":
        handleNewVoiceRoomMember(event);
        break;
      default:
        console.warn("Unsupported message type:", event.type);
        break;
    }
  };

  const handleNewMessage = (payload: EventPayload) => {
    setChannelMessages((prevMessages) => [...prevMessages, payload]);
  };

  const handleNewVoiceRoomMember = (event) => {
    console.log("New member payload", event);

    setVoiceChannels((prevChannels) => {
      if (!prevChannels || !Array.isArray(prevChannels)) {
        console.error("prevChannels is not an array:", prevChannels);
        return [];
      }

      const updatedChannels = prevChannels.map((channel) => {
        if (channel && channel.channel_id === event?.Payload?.channel_id) {
          console.log(`Updating channel ${channel.channel_id}`);
          const updatedChannel = {
            ...channel,
            members: [...(channel.members || []), event.Payload.member],
          };
          console.log("Updated channel:", updatedChannel);
          return updatedChannel;
        }
        return channel;
      });

      console.log("Previous channels:", prevChannels);
      console.log("Updated channels:", updatedChannels);

      // Check if any channel was actually updated
      const channelUpdated = updatedChannels.some(
        (channel, index) => channel !== prevChannels[index]
      );

      if (!channelUpdated) {
        console.warn(
          "No channel was updated. Event may not match any existing channel."
        );
      }

      return updatedChannels;
    });
  };

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

  const changeVoiceRoom = async (server: string | null, channel: string) => {
    if (!auth?.isAuthenticated) {
      return;
    }
    try {
      await auth?.leaveCurrentVoiceChannel();
      const changeEvent = new ChangeVoiceRoomEvent(channel);
      await sendEvent("change_voice_room", changeEvent);
      await addVoiceMember(auth?.user?.id, channel, server, auth?.user?.handle);
    } catch (error) {
      console.error(error);
    }
  };

  const addVoiceMember = (
    user_id: string | null | undefined,
    channel_id: string | null,
    server_id: string | null,
    handle: string | null | undefined
  ) => {
    if (socket && connected) {
      const outgoingEvent = new AddVoiceMemberEvent(
        user_id,
        channel_id,
        server_id,
        handle
      );
      sendEvent("add_voice_member", outgoingEvent);
    } else {
      console.error("WebSocket is not connected or invalid user/message");
      throw Error;
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
    voiceRoom,
    setTextRoom,
    changeChatRoom,
    channelMessages,
    setChannelMessages,
    changeVoiceRoom,
    setVoiceRoom,
    voiceChannels,
    setVoiceChannels,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
