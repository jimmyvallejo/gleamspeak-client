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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import { notifications } from "@mantine/notifications";
import { DeleteUserModal } from "../modals/DeleteUserModal";
import { useDisclosure } from "@mantine/hooks";

interface SettingsFormProps extends PaperProps {
  id: string,
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  bio: string;
  refetch: () => Promise<any>;
}

export const SettingsForm = ({
  id,
  email,
  firstName,
  lastName,
  handle,
  bio,
  refetch,
  ...PaperProps
}: SettingsFormProps) => {
  const auth = useContext(AuthContext);
  const [opened, { open, close }] = useDisclosure(false);
  const api = useApi();
  const queryClient = useQueryClient();


  const form = useForm({
    initialValues: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      handle: handle,
      bio: bio,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      handle: (val) => {
        if (!val || val.trim() === "") {
          return "Display name is required";
        }
        return null;
      },
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      email,
      handle,
      firstName,
      lastName,
      bio,
    }: {
      email: string;
      handle: string;
      firstName: string;
      lastName: string;
      bio: string;
    }) => {
      if (!auth) throw new Error("Auth context not available");
      const data = {
        email: email,
        handle: handle,
        first_name: firstName,
        last_name: lastName,
        bio: bio,
      };
      await api.put(`/v1/users`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      refetch();
      notifications.show({
        message: "Successfuly updated user",
        color: "green",
      });
    },
    onError: (error) => {
      console.error("Update failed:", error);
      form.setErrors({ email: "Update failed" });
      notifications.show({
        message: "Failed to update user",
        color: "red",
      });
    },
  });

  const handleUpdate = form.onSubmit((values) => {
    if (form.validate().hasErrors) {
      return;
    }
    updateUserMutation.mutate({
      email: values.email,
      handle: values.handle,
      firstName: values.firstName,
      lastName: values.lastName,
      bio: values.bio,
    });
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      if (!auth) throw new Error("Auth context not available");
      await api.delete(`/v1/users/${id}`);
    },
    onSuccess: () => {
      auth?.logout()
      notifications.show({
        message: "Successfully deleted user",
        color: "green",
      });
    },
    onError: (error) => {
      console.error("Deletion failed:", error);
      notifications.show({
        message: "Failed to delete user",
        color: "red",
      });
    },
  });

  const handleDelete = () => {
    deleteUserMutation.mutate();
  };

  return (
    <Paper radius="md" p="xl" withBorder {...PaperProps}>
      <Divider label="Update Profile" labelPosition="center" my="md" />

      <form onSubmit={handleUpdate}>
        <Stack>
          <TextInput
            required
            label="Email"
            placeholder="hello@gleamspeak.com"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email}
            radius="md"
          />
          <TextInput
            required
            label="Display Name"
            placeholder="gleamspeak"
            value={form.values.handle}
            onChange={(event) =>
              form.setFieldValue("handle", event.currentTarget.value)
            }
            error={form.errors.handle}
            radius="md"
          />
          <TextInput
            label="First Name"
            placeholder="No first name yet"
            value={form.values.firstName}
            onChange={(event) =>
              form.setFieldValue("firstName", event.currentTarget.value)
            }
            radius="md"
          />
          <TextInput
            label="Last Name"
            placeholder="No last name yet"
            value={form.values.lastName}
            onChange={(event) =>
              form.setFieldValue("lastName", event.currentTarget.value)
            }
            radius="md"
          />
          <Textarea
            label="Bio"
            minRows={3}
            placeholder="A short bio about yourself"
            value={form.values.bio}
            onChange={(event) =>
              form.setFieldValue("bio", event.currentTarget.value)
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
          onClick={() => open()}
          radius="xl"
          styles={(theme: MantineTheme) => ({
            root: {
              backgroundColor: theme.colors.red[7],
            },
          })}
        >
          {upperFirst("Delete Account")}
        </Button>
      </Group>
      <DeleteUserModal handleDelete={handleDelete} handle={handle} opened={opened} onClose={close} />
    </Paper>
  );
};
