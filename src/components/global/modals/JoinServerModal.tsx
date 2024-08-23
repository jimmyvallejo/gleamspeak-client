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
} from "@mantine/core";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import { notifications } from "@mantine/notifications";

interface JoinServerModalProps {
  opened: boolean;
  onClose: () => void;
}

export function JoinServerModal({ opened, onClose }: JoinServerModalProps) {
  const auth = useContext(AuthContext);
  const api = useApi();
  const queryClient = useQueryClient();

  if (!auth) {
    console.log("Context not loaded");
  }

  const form = useForm({
    initialValues: {
      invite_code: "",
    },
    validate: {
      invite_code: (val) => {
        if (!val || val.trim() === "" || val.length < 3) {
          return "Valid server code is required (minimum 8 characters)";
        }
        return null;
      },
    },
  });

  const createServerMutation = useMutation({
    mutationFn: async ({ invite_code }: { invite_code: string }) => {
      if (!auth) throw new Error("Auth context not available");
      const data = {
        invite_code: invite_code,
      };
      const response = await api.post(`/v1/servers/code`, data);
      return response.data;
    },
    onSuccess: (response) => {
      console.log("Successfuly joined server :", response);
      form.reset();
      onClose();
      notifications.show({
        message: "Successfuly joined server",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["userServers"] });
    },
    onError: (error: Error) => {
      console.error("Server creation failed:", error);
      form.setErrors({
        server_name: error.message || "Server creation failed.",
      });
      notifications.show({ message: "Server Creation Failed", color: "red" });
    },
  });

  const handleCreateServer = form.onSubmit((values) => {
    if (form.validate().hasErrors) {
      return;
    }
    createServerMutation.mutate({
      invite_code: values.invite_code,
    });
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Join server"
      className="text-bold"
      centered
    >
      <Paper radius="md" p="xl">
        <Center>
          <Text size="lg" fw={500} className="">
            Enter code below to join
          </Text>
        </Center>
        <form onSubmit={handleCreateServer} className="mt-10">
          <Stack>
            <TextInput
              required
              label="Invite Code"
              placeholder="Invite code for gleamspeak server"
              value={form.values.invite_code}
              onChange={(event) =>
                form.setFieldValue("invite_code", event.currentTarget.value)
              }
              error={form.errors.server_name}
              radius="md"
            />
          </Stack>
          <Box mt="lg" style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              radius="xxl"
              loading={createServerMutation.isPending}
            >
              {upperFirst("Join")}
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
}
