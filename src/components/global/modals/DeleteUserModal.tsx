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

interface CreateServerModalProps {
  opened: boolean;
  onClose: () => void;
  handle: string;
  handleDelete: () => void;

}

export const DeleteUserModal = ({
  opened,
  onClose,
  handle,
  handleDelete
}: CreateServerModalProps) => {
  const [typedName, setTypedName] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    console.log(typedName)
    console.log(handle)
    if (typedName === handle) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [handle, typedName]);


  const handleClick = () => {
    handleDelete()
    setTypedName("")
    setDisabled(true)
  }
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Delete User: ${handle} `}
      className="text-bold"
      centered
      radius="md"
    >
      <Paper radius="md" p="xl" withBorder>
        <Center>
          <Stack>
          <Text size="lg" fw={500} className="">
            Type display name below and click Delete to confirm deletion of "{handle}".
          </Text>
          <Text size="lg">
          This is <span className="underline text-red-500">NOT</span> reversible.
          </Text>
          </Stack>
        </Center>
        <Stack mt={20}>
          <TextInput
            required
            label="Display Name"
            placeholder="Your display name"
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
