import { upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Box,
  Text,
  Paper,
  Button,
  Stack,
  Modal,
  Center,
  Select,
} from "@mantine/core";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import { notifications } from "@mantine/notifications";
import { languages } from "../../../constants/constants";
import { useQueryClient } from "@tanstack/react-query";

interface CreateChannelModalProps {
  opened: boolean;
  serverID: string | null | undefined;
  onClose: () => void;
  isText: boolean;
}

export function CreateChannelModal({
  opened,
  onClose,
  serverID,
  isText,
}: CreateChannelModalProps) {
  const auth = useContext(AuthContext);
  const api = useApi();

  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      channel_name: "",
      language: languages.english,
    },
    validate: {
      channel_name: (val) => {
        if (!val || val.trim() === "" || val.length < 3) {
          return "Valid channel name is required (minimum 3 characters)";
        }
        return null;
      },
    },
  });

  const createTextChannelMutation = useMutation({
    mutationFn: async ({
      channelName,
      language,
      serverID,
    }: {
      channelName: string;
      language: string;
      serverID: string | null | undefined;
    }) => {
      if (!auth) throw new Error("Auth context not available");
      const data = {
        channel_name: channelName,
        language: language,
        server_id: serverID,
      };
      const response = await api.post(`/v1/channels/text`, data);
      return response.data;
    },
    onSuccess: (response) => {
      console.log("Channel creation successful:", response);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["userTextChannels"] });
      onClose();
      notifications.show({
        message: "Channel Creation Successful",
        color: "green",
      });
    },
    onError: (error: Error) => {
      console.error("Channel creation failed:", error);
      form.setErrors({
        server_name: error.message || "Channel creation failed.",
      });
      notifications.show({ message: "Channel Creation Failed", color: "red" });
    },
  });

  const createVoiceChannelMutation = useMutation({
    mutationFn: async ({
      channelName,
      language,
      serverID,
    }: {
      channelName: string;
      language: string;
      serverID: string | null | undefined;
    }) => {
      if (!auth) throw new Error("Auth context not available");
      const data = {
        channel_name: channelName,
        language: language,
        server_id: serverID,
      };
      const response = await api.post(`/v1/channels/voice`, data);
      return response.data;
    },
    onSuccess: (response) => {
      console.log("Channel creation successful:", response);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["userVoiceChannels"] });
      onClose();
      notifications.show({
        message: "Channel Creation Successful",
        color: "green",
      });
    },
    onError: (error: Error) => {
      console.error("Channel creation failed:", error);
      form.setErrors({
        server_name: error.message || "Channel creation failed.",
      });
      notifications.show({ message: "Channel Creation Failed", color: "red" });
    },
  });

  const handleCreateTextChannel = form.onSubmit((values) => {
    if (form.validate().hasErrors) {
      return;
    }
    createTextChannelMutation.mutate({
      channelName: values.channel_name,
      language: values.language,
      serverID: serverID,
    });
  });

  const handleCreateVoiceChannel = form.onSubmit((values) => {
    if (form.validate().hasErrors) {
      return;
    }
    createVoiceChannelMutation.mutate({
      channelName: values.channel_name,
      language: values.language,
      serverID: serverID,
    });
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isText ? "Create Text Channel" : "Create Voice Channel"}
      className="text-bold"
      centered
      radius="md"
      size="lg"
    >
      <Paper radius="md" p="xl" withBorder className="bg-gray-50">
        <Center>
          <Text size="lg" fw={500} className="">
            Set Name and Select Language
          </Text>
        </Center>
        <form
          onSubmit={isText ? handleCreateTextChannel : handleCreateVoiceChannel}
          className="mt-10"
        >
          <Stack>
            <TextInput
              required
              label="Channel Name"
              placeholder="Your channel's name"
              value={form.values.channel_name}
              onChange={(event) =>
                form.setFieldValue("channel_name", event.currentTarget.value)
              }
              error={form.errors.server_name}
              radius="md"
            />
            <Select
              required
              label="Language"
              placeholder="Pick a language"
              data={[
                { value: languages.english, label: "English" },
                { value: languages.spanish, label: "Spanish" },
                { value: languages.french, label: "French" },
              ]}
              value={form.values.language}
              onChange={(value) => form.setFieldValue("language", value || "")}
            />
          </Stack>
          <Box mt="lg" style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              radius="xxl"
              loading={createTextChannelMutation.isPending}
            >
              {upperFirst("Create")}
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
}
