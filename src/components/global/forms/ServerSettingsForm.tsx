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
  MantineTheme,
} from "@mantine/core";

import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { ServerContext } from "../../../contexts/ServerContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

interface ServerSettingsFormProps extends PaperProps {
  serverID: string | undefined;
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
  const server = useContext(ServerContext);
  const api = useApi();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const deleteServerMutation = useMutation({
    mutationFn: async () => {
      if (!auth) throw new Error("Auth context not available");
      await api.delete(`/v1/servers/${serverID}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["serverSettings, userServers"],
      });
      queryClient.refetchQueries({ queryKey: ["userServers"] });
      navigate("/");
      handleServerChange()
      notifications.show({
        message: "Successfully deleted server",
        color: "green",
      });
    },
    onError: (error) => {
      console.error("Deletion failed:", error);
      notifications.show({
        message: "Failed to delete server",
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

  const handleDelete = () => {
    deleteServerMutation.mutate();
  };

  const handleServerChange = () => {
    server?.setServerID(null);
    server?.setServerName(null);
    server?.setServerCode(null);
    server?.setOwnerID(null);
    server?.setServerBanner(null);

  };

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
      <Divider
        label="Danger Zone"
        labelPosition="center"
        my="md"
        styles={(theme) => ({
          label: {
            color: theme.colors.red[6],
          },
        })}
      />
      <Group justify="end" mt="xl">
        <Button
          onClick={handleDelete}
          radius="xl"
          styles={(theme: MantineTheme) => ({
            root: {
              backgroundColor: theme.colors.red[7],
              "&:hover": {
                backgroundColor: theme.colors.red[8],
              },
            },
          })}
        >
          {upperFirst("Delete Server")}
        </Button>
      </Group>
    </Paper>
  );
};
