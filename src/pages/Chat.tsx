import { useState, useContext, useEffect, useRef, KeyboardEvent } from "react";
import {
  Paper,
  Text,
  TextInput,
  Button,
  Stack,
  Avatar,
  Group,
  Box,
  Loader,
  Alert,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useWebSocket } from "../hooks/useWebsocket";
import { AuthContext } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import { formatMessageDate } from "../utils/date";

export function Chat() {
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ws = useWebSocket();
  const auth = useContext(AuthContext);
  const { channelMessages, sendMessage, textRoom, setChannelMessages } = ws;

  const api = useApi();

  const fetchChannelMessages = async () => {
    try {
      const response = await api.get(`/v1/messages/${textRoom}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching channel messages:", error);
      throw error;
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["channelMessages", textRoom],
    queryFn: fetchChannelMessages,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!auth?.user && !!textRoom,
  });

  useEffect(() => {
    if (data) {
      console.log("Channel messages fetched successfully");
      console.log(data);
      setChannelMessages(data);
    }
  }, [data, setChannelMessages]);

  const handleSend = () => {
    console.log(auth?.user, newMessage);

    if (!auth?.user) {
      console.error("User is not authenticated");
      return;
    }

    const { id, handle, avatar } = auth.user;

    if (newMessage.trim()) {
      sendMessage(id, handle, newMessage, image, avatar);
    }
    setNewMessage("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [channelMessages]);

  return (
    <Paper
      shadow="sm"
      p="md"
      style={{ height: "90vh", display: "flex", flexDirection: "column" }}
    >
      <div className="overflow-y-scroll pr-6" style={{ flex: 1 }}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader size="xl" variant="dots" />
          </div>
        ) : isError ? (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Error!"
            color="red"
          >
            {error?.message || "An error occurred while fetching messages."}
          </Alert>
        ) : (
          <Stack className="p-1">
            {channelMessages.map((message) => (
              <Box
                key={message.id}
                p="xs"
                className={`rounded-md w-full min-h-[90px] mt-3`}
                style={{
                  background:
                    message.owner_id === auth?.user?.id ? "#3498db" : "#1A5319",
                }}
              >
                <Text size="xs">
                  {channelMessages
                    ? formatMessageDate(message?.updated_at).toLocaleString()
                    : ""}
                </Text>
                <Group className="mt-2">
                  <Avatar
                    src={
                      message.owner_image ? message.owner_image : "/user.png"
                    }
                    radius="xl"
                  />
                  <div className="flex-1 min-w-0">
                    <Text fw={"bold"} size="sm">
                      {message.handle}
                    </Text>
                    <Text size="sm" className="break-words">
                      {message.message}
                    </Text>
                  </div>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
        <div ref={messagesEndRef} />
      </div>
      <Group mt="md" align="flex-end">
        <TextInput
          placeholder="Type a message..."
          value={newMessage}
          onChange={(event) => setNewMessage(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
          disabled={isLoading || isError}
        />
        <Button onClick={handleSend} disabled={isLoading || isError}>
          Send
        </Button>
      </Group>
    </Paper>
  );
}
