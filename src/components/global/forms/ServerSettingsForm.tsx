import { upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Stack,
  Textarea,
} from "@mantine/core";

import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import { notifications } from "@mantine/notifications";

interface ServerSettingsFormProps extends PaperProps {
  serverID: string;
  serverName: string;
  description: string;
  refetch: () => Promise<any>;
}

export const ServerSettingsForm = ({
  serverID,
  serverName,
  description,
  refetch,
  ...PaperProps
}: ServerSettingsFormProps) => {
  const auth = useContext(AuthContext);
  const api = useApi();
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      serverName: serverName,
      description: description,
    },
    validate: {
      serverName: (val) => {
        if (!val || val.trim() === "") {
          return "Display name is required";
        }
        return null;
      },
    },
  });

  const updateServerMutation = useMutation({
    mutationFn: async ({
      serverName,
      description,
    }: {
      serverName: string;
      description: string;
    }) => {
      if (!auth) throw new Error("Auth context not available");
      const data = {
        server_id: serverID,
        server_name: serverName,
        description: description,
      };
      await api.put(`/v1/servers`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serverSettings"] });
      refetch();
      notifications.show({
        message: "Successfuly updated server",
        color: "green",
      });
    },
    onError: (error) => {
      console.error("Update failed:", error);
      form.setErrors({ email: "Update failed" });
      notifications.show({
        message: "Failed to update server",
        color: "red",
      });
    },
  });

  const handleUpdate = form.onSubmit((values) => {
    if (form.validate().hasErrors) {
      return;
    }
    updateServerMutation.mutate({
      serverName: values.serverName,
      description: values.description,
    });
  });

  return (
    <Paper radius="md" p="xl" withBorder {...PaperProps}>
      <Divider label="Update Server" labelPosition="center" my="md" />

      <form onSubmit={handleUpdate}>
        <Stack>
          <TextInput
            required
            label="Server Name"
            placeholder="gleamspeak"
            value={form.values.serverName}
            onChange={(event) =>
              form.setFieldValue("serverName", event.currentTarget.value)
            }
            error={form.errors.email}
            radius="md"
          />
          <Textarea
            label="Description"
            minRows={3}
            placeholder="A short description about the server"
            value={form.values.description}
            onChange={(event) =>
              form.setFieldValue("description", event.currentTarget.value)
            }
            radius="md"
          />
        </Stack>

        <Group justify="end" mt="xl">
          <Button type="submit" radius="xl">
            {upperFirst("Update")}
          </Button>
        </Group>
      </form>
    </Paper>
  );
};
