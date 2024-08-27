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

interface CreateServerModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CreateServerModal = ({ opened, onClose }: CreateServerModalProps) => {
  const auth = useContext(AuthContext);
  const api = useApi();
  const queryClient = useQueryClient();

  if (!auth) {
    console.log("Context not loaded");
  }

  const form = useForm({
    initialValues: {
      server_name: "",
    },
    validate: {
      server_name: (val) => {
        if (!val || val.trim() === "" || val.length < 3) {
          return "Valid server name is required (minimum 3 characters)";
        }
        return null;
      },
    },
  });

  const createServerMutation = useMutation({
    mutationFn: async ({ server_name }: { server_name: string }) => {
      if (!auth) throw new Error("Auth context not available");
      const data = {
        server_name: server_name,
      };
      const response = await api.post(`/v1/servers`, data);
      return response.data;
    },
    onSuccess: (response) => {
      console.log("Server creation successful:", response);
      form.reset();
      onClose();
      notifications.show({
        message: "Server Creation Successful",
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
      server_name: values.server_name,
    });
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Your Server"
      className="text-bold"
      centered
    >
      <Paper radius="md" p="xl">
        <Center>
          <Text size="lg" fw={500} className="">
            Your Adventure Begins Here
          </Text>
        </Center>
        <form onSubmit={handleCreateServer} className="mt-10">
          <Stack>
            <TextInput
              required
              label="Server Name"
              placeholder="Your server's name"
              value={form.values.server_name}
              onChange={(event) =>
                form.setFieldValue("server_name", event.currentTarget.value)
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
              {upperFirst("Create")}
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
}
