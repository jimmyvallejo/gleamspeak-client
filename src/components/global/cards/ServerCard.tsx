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
  Image,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconX, IconDownload, IconEdit } from "@tabler/icons-react";
import { useState, useRef, useContext } from "react";
import { useApi } from "../../../hooks/useApi";
import { AuthContext } from "../../../contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notifications } from "@mantine/notifications";

interface ServerCardProps {
  bannerUrl: string;
  iconUrl: string;
  serverName: string;
  memberCount: string;
}

interface SignedUrlResponse {
  url: string;
  public_url: string;
}

export const ServerCard = ({
  bannerUrl,
  iconUrl,
  serverName,
  memberCount,
}: ServerCardProps) => {
  const DEFAULT_IMAGE = "/triangles.webp";

  const theme = useMantineTheme();
  const iconOpenRef = useRef<() => void>(null);
  const bannerOpenRef = useRef<() => void>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(iconUrl);
  const [bannerSrc, setBannerSrc] = useState<string>(bannerUrl);

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

  const updateDbImage = useMutation<
    void,
    Error,
    { url: string; type: "avatar" | "banner" }
  >({
    mutationFn: async ({ url, type }) => {
      if (!auth) throw new Error("Auth context not available");
      await api.put(`/v1/users/${type}`, { url });
    },
  });

  const handleDrop = async (files: File[], type: "avatar" | "banner") => {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === "avatar") {
        setAvatarSrc(event.target?.result as string);
      } else {
        setBannerSrc(event.target?.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      const result = await requestSignedUrl.mutateAsync({
        fileName: file.name,
        fileType: file.type,
      });

      await uploadToS3(result.url, file);
      await updateDbImage.mutateAsync({ url: result.public_url, type });
      queryClient.invalidateQueries({ queryKey: ["serverSettings"] });
      notifications.show({
        message: `Successfully updated ${type}`,
        color: "green",
      });
    } catch (error) {
      console.error(`Error in ${type} upload process:`, error);
      if (type === "avatar") {
        setAvatarSrc(iconUrl);
      } else {
        setBannerSrc(bannerUrl);
      }
      notifications.show({
        message: `Failed to update ${type}`,
        color: "red",
      });
    }
  };

  return (
    <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
      <Dropzone
        openRef={bannerOpenRef}
        onDrop={(files) => handleDrop(files, "banner")}
        accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.webp]}
        maxSize={5 * 1024 ** 2}
        radius="md"
        p={0}
        mb="md"
        style={{ height: rem(120), cursor: "pointer", overflow: "hidden" }}
      >
        <Group
          justify="center"
          align="center"
          style={{ height: "100%", pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconDownload
              size={rem(30)}
              color={theme.colors.blue[6]}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={rem(30)} color={theme.colors.red[6]} stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Box
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: theme.radius.md,
                overflow: "hidden",
              }}
            >
              <Image
                src={bannerSrc ? bannerSrc : DEFAULT_IMAGE}
                alt="Server Banner"
                height={120}
                fit="cover"
              />
            </Box>
          </Dropzone.Idle>
        </Group>
      </Dropzone>

      <Dropzone
        openRef={iconOpenRef}
        onDrop={(files) => handleDrop(files, "avatar")}
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
              size={rem(30)}
              color={theme.colors.blue[6]}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={rem(30)} color={theme.colors.red[6]} stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Box style={{ position: "relative" }}>
              <Avatar src={avatarSrc} size={120} radius={120} />
            </Box>
          </Dropzone.Idle>
        </Group>
      </Dropzone>

      <Group justify="center" mt="md">
        <Button variant="default" onClick={() => bannerOpenRef.current?.()}>
          Change Banner
        </Button>
        <Button variant="default" onClick={() => iconOpenRef.current?.()}>
          Change Icon
        </Button>
      </Group>

      <Text ta="center" fz="lg" fw={500} mt="md">
        {serverName}
      </Text>
      <Text ta="center" c="dimmed" fz="sm">
        {"Member Count:"} • {memberCount}
      </Text>
    </Paper>
  );
};
