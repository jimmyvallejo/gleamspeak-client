import{ useState } from "react";
import {
  Paper,
  Text,
  TextInput,
  Button,
  Stack,
  Avatar,
  Group,
  Box,
} from "@mantine/core";

interface Message {
  id: number;
  user: string;
  text: string;
  avatar: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now(),
        user: "me",
        text: newMessage,
        avatar: "https://avatars.githubusercontent.com/u/10353856?s=460&v=4", // placeholder avatar
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  return (
    <Paper
      shadow="sm"
      p="md"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div className="overflow-y-scroll pr-6" style={{ flex: 1 }}>
        <Stack className="p-4" >
          {messages.map((message) => (
            <Box
              key={message.id}
              p="xs"
              className={`rounded-md w-[25%] ${message.user === "You" ? "ml-auto" : "mr-auto"}`}
              style={{
                background: message.user === "You" ? "red" : "blue",
              }}
            >
              <Group>
                <Avatar src={message.avatar} radius="xl" />
                <div>
                  <Text size="sm" >
                    {message.user}
                  </Text>
                  <Text size="sm">{message.text}</Text>
                </div>
              </Group>
            </Box>
          ))}
        </Stack>
      </div>
      <Group mt="md" align="flex-end">
        <TextInput
          placeholder="Type a message..."
          value={newMessage}
          onChange={(event) => setNewMessage(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button onClick={handleSend}>Send</Button>
      </Group>
    </Paper>
  );
}
