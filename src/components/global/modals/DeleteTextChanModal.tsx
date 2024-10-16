import { upperFirst } from "@mantine/hooks";
import {
  TextInput,
  Box,
  Text,
  Paper,
  Button,
  Stack,
  Modal,
  Center,
  MantineTheme,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

interface DeleteChannelModalProps {
  opened: boolean;
  onClose: () => void;
  handleDelete: () => void;
  channelName: string | null;
}

export const DeleteTextChannelModal = ({
  opened,
  onClose,
  channelName,
  handleDelete,
}: DeleteChannelModalProps) => {
  const [typedName, setTypedName] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (typedName === channelName) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [channelName, typedName]);

  const handleClick = () => {
    handleDelete();
    setTypedName("");
    setDisabled(true);
  };
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Delete Channel: ${channelName}`}
      className="text-bold"
      size="lg"
      centered
      radius="md"
    >
      <Paper
        radius="md"
        p="xl"
        withBorder
        className="bg-gray-50"
      >
        <Center>
          <Stack>
            <IconAlertTriangle size={48} className="text-red-500" />
            <Text size="lg" fw={500}>
              Type channel name below and click Delete to confirm deletion of "
              {channelName}".
            </Text>
            <Text size="lg">
              This is <span className="underline text-red-500">NOT</span>{" "}
              reversible.
            </Text>
          </Stack>
        </Center>
        <Stack mt={20}>
          <TextInput
            required
            label="Channel Name"
            placeholder="Channel Name"
            className="border-gray-300 dark:border-gray-600"
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
            radius="md"
          />
        </Stack>
        <Box mt="lg" style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            styles={(theme: MantineTheme) => ({
              root: {
                backgroundColor: theme.colors.red[7],
              },
            })}
            type="submit"
            radius="xxl"
            disabled={disabled}
            onClick={handleClick}
          >
            {upperFirst("Delete")}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};
