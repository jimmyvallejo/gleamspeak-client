import {
  Avatar,
  Text,
  Button,
  Paper,
  Group,
  rem,
  useMantineTheme,
  Center,
  Box,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconX, IconDownload, IconEdit } from "@tabler/icons-react";
import { useState, useRef, useContext } from "react";
import { useApi } from "../../../hooks/useApi";
import { AuthContext } from "../../../contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notifications } from "@mantine/notifications";

interface UserCardProps {
  source: string;
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
}

interface SignedUrlResponse {
  url: string;
  public_url: string;
}

export const UserCard = ({
  source,
  firstName,
  lastName,
  email,
  handle,
}: UserCardProps) => {
  const theme = useMantineTheme();
  const openRef = useRef<() => void>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(source);

  const auth = useContext(AuthContext);
  const api = useApi();
  const queryClient = useQueryClient();

  const requestSignedUrl = useMutation<
    SignedUrlResponse,
    Error,
    { fileType: string; fileName: string }
  >({
    mutationFn: async ({ fileType, fileName }) => {
      if (!auth) throw new Error("Auth context not available");
      const response = await api.post(`/v1/s3/url`, {
        filetype: fileType,
        filename: fileName,
      });
      return response.data;
    },
  });

  const uploadToS3 = async (url: string, file: File) => {
    const uploadResult = await axios.put(url, file, {
      headers: { "Content-Type": file.type },
    });
    if (uploadResult.status !== 200) {
      throw new Error("Failed to upload file to S3");
    }
    return uploadResult;
  };

  const updateDbAvatar = useMutation<void, Error, { url: string }>({
    mutationFn: async ({ url }) => {
      if (!auth) throw new Error("Auth context not available");
      await api.put(`/v1/users/avatar`, { url });
    },
  });

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await requestSignedUrl.mutateAsync({
        fileName: file.name,
        fileType: file.type,
      });

      await uploadToS3(result.url, file);
      await updateDbAvatar.mutateAsync({ url: result.public_url });
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      notifications.show({
        message: "Successfuly updated avatar",
        color: "green",
      });
    } catch (error) {
      console.error("Error in upload process:", error);
      setAvatarSrc(source);
      notifications.show({
        message: "Failed to update avatar",
        color: "red",
      });
    }
  };

  return (
    <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
      <Dropzone
        openRef={openRef}
        onDrop={handleDrop}
        accept={[
          MIME_TYPES.png,
          MIME_TYPES.jpeg,
          MIME_TYPES.svg,
          MIME_TYPES.webp,
        ]}
        maxSize={5 * 1024 ** 2}
        radius={120}
        p={0}
        mx="auto"
        style={{
          width: rem(120),
          height: rem(120),
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <Group
          justify="center"
          align="center"
          style={{ height: "100%", pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconDownload
              style={{ width: rem(30), height: rem(30) }}
              color={theme.colors.blue[6]}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{ width: rem(30), height: rem(30) }}
              color={theme.colors.red[6]}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Box style={{ position: "relative" }}>
              <Avatar src={avatarSrc} size={120} radius={120} />
              <Box
                style={{
                  position: "absolute",
                  top: rem(1),
                  right: rem(1),
                  background: theme.colors.gray[2],
                  borderRadius: "50%",
                  paddingTop: 4,
                  paddingLeft: 2,
                  paddingRight: 2,
                }}
              >
                <IconEdit color={theme.colors.gray[7]} />
              </Box>
            </Box>
          </Dropzone.Idle>
        </Group>
      </Dropzone>

      <Center>
        <Button variant="default" mt="md" onClick={() => openRef.current?.()}>
          Change avatar
        </Button>
      </Center>
      <Text ta="center" fz="lg" fw={500} mt="md">
        {firstName} {lastName}
      </Text>
      <Text ta="center" c="dimmed" fz="sm">
        {email} • {handle}
      </Text>
    </Paper>
  );
};
