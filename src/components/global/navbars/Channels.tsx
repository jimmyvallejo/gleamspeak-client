import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  Accordion,
  Center,
  UnstyledButton,
  rem,
  Divider,
  Text,
  Group,
  Tooltip,
  List,
  ListItem,
} from "@mantine/core";
import {
  IconHome2,
  IconCopy,
  IconSettings,
  IconMessage2,
  IconHeadphones,
  IconTrash,
} from "@tabler/icons-react";

import { AuthContext } from "../../../contexts/AuthContext";
import { ServerContext } from "../../../contexts/ServerContext";
import { useApi } from "../../../hooks/useApi";
import { useWebSocket } from "../../../hooks/useWebsocket";
import { copyToClipboard } from "../../../utils/copy";
import { CreateChannelModal } from "../modals/CreateChannelModal";
import classes from "./Channel.module.css";

interface NavbarChannelProps {
  icon: typeof IconHome2;
  label: string;
  onClick?(): void;
  serverID: string | null;
  active?: boolean;
}

export type Member = {
  user_id: string;
  handle: string;
};

export type Channel = {
  channel_id: string;
  owner_id: string;
  server_id: string;
  language_id: string;
  channel_name: string;
  last_active: string;
  is_locked: boolean;
  channel_created_at: string;
  channel_updated_at: string;
  members: Member[];
};

const channels = [
  { emoji: "💬", value: "Text" },
  { emoji: "🔊", value: "Voice" },
  { emoji: "🔴", value: "Video" },
];

const Server = ({ icon: Icon, onClick, active }: NavbarChannelProps) => {
  return (
    <UnstyledButton
      onClick={onClick}
      className={classes.link}
      data-active={active || undefined}
    >
      <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
    </UnstyledButton>
  );
};

export const Channels = () => {
  const auth = useContext(AuthContext);
  const server = useContext(ServerContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [textActive, setTextActive] = useState<number | null>(null);
  const [voiceActive, setVoiceActive] = useState<number | null>(null);
  const [isTextModal, setIsTextModal] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const api = useApi();
  const ws = useWebSocket();
  const queryClient = useQueryClient();


  const fetchUserTextChannels = async () => {
    const response = await api.get(`/v1/channels/${server?.serverID}`);
    return response.data;
  };

  const fetchUserVoiceChannels = async () => {
    const response = await api.get(`/v1/channels/voice/${server?.serverID}`);
    return response.data;
  };

  const { data: text, error: textError } = useQuery({
    queryKey: ["userTextChannels", server?.serverID],
    queryFn: fetchUserTextChannels,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!auth?.user && !!server?.serverID,
  });

  const { data: voice, error: voiceError } = useQuery({
    queryKey: ["userVoiceChannels", server?.serverID],
    queryFn: fetchUserVoiceChannels,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!auth?.user && !!server?.serverID,
  });

  const deleteTextChannelMutation = useMutation({
    mutationFn: async ({ channelID }: { channelID: string }) => {
      if (!auth) throw new Error("Auth context not available");
      await api.delete(`/v1/channels/text/${channelID}`);
    },
    onSuccess: (_, variables) => {
      console.log("ChannelID:", variables.channelID);
      console.log("Successfully deleted channel");
      notifications.show({
        message: "Successfully deleted channel",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["userTextChannels"] });
      if (location.pathname.includes(`/chat/${variables.channelID}`)) {
        navigate("/");
      }
    },
    onError: () => {
      notifications.show({ message: "Failed to delete channel", color: "red" });
    },
  });

  useEffect(() => {
    if (voice) {
      ws.setVoiceChannels(voice.channels);
    } else {
      console.error("Invalid voice channels data:", voice);
    }
  }, [voice]);

  useEffect(() => {
    setTextActive(null);
    setVoiceActive(null);
  }, [server?.serverID]);


  const handleTextChannel = (index: number, id: string) => {
    setTextActive(index);
    queryClient.invalidateQueries({ queryKey: ["channelMessages"] });
    ws.setTextRoom(id);
  };

  const handleVoiceChannel = (channel: Channel, index: number) => {
    setVoiceActive(index);
    ws.setVoiceRoom(channel.channel_id);
    ws.changeVoiceRoom(server?.serverID, channel.channel_id);
    togglePlay();
  };

  const handleCopy = () => {
    if (server?.serverCode) {
      copyToClipboard(server.serverCode);
      notifications.show({
        message: "Copied to clipboard",
        color: "green",
      });
    }
  };

  const handleDeleteChannel = (channelID: string) => {
    deleteTextChannelMutation.mutate({ channelID });
  };

  const openVoiceModal = () => {
    setIsTextModal(false);
    open();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
  };

  const TextChannels = (
    <Accordion.Item
      className="w-full"
      key={channels[0].value}
      value={channels[0].value}
    >
      <Accordion.Control icon={channels[0].emoji}>
        {channels[0].value}
      </Accordion.Control>
      <Accordion.Panel className="w-full">
        {text?.channels.map((channel: Channel, index: number) => (
          <Group
            key={channel?.channel_id}
            className={`w-full items-center ${
              textActive === index ? "bg-[#262626]" : ""
            } rounded-md mt-2`}
          >
            <Link
              className="no-underline text-inherit w-[75%]"
              to={`/chat/${channel?.channel_id}`}
            >
              <div
                onClick={() => handleTextChannel(index, channel?.channel_id)}
                className={`flex items-center   h-[2rem]`}
              >
                <p className="text-[17px] px-4 m-0">
                  <span className="mr-2">#</span>
                  {channel?.channel_name.slice(0, 15)}
                </p>
              </div>
            </Link>
            {auth?.user?.id === server?.ownerID && (
              <IconTrash
                className="cursor-pointer wiggle-hover"
                size={16}
                onClick={() => handleDeleteChannel(channel?.channel_id)}
              />
            )}
          </Group>
        ))}
        {textError && (
          <p className="text-red-300">Text channels failed to load</p>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );

  const VoiceChannels = (
    <Accordion.Item key={channels[1].value} value={channels[1].value}>
      <Accordion.Control icon={channels[1].emoji}>
        {channels[1].value}
      </Accordion.Control>
      <Accordion.Panel>
        {ws.voiceChannels && ws.voiceChannels.length > 0 ? (
          ws.voiceChannels.map((channel: Channel, index: number) => (
            <div
              key={channel.channel_id}
              className={`flex flex-col ${
                voiceActive === index ? "bg-[#262626]" : ""
              } rounded-md`}
            >
              <Group
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                className="py-2"
              >
                <div
                  onClick={() => handleVoiceChannel(channel, index)}
                  className="flex items-center rounded-md cursor-pointer w-[75%]"
                >
                  <p className="text-[17px] px-3 flex items-center">
                    <span className="mr-2 text-sm">🎧</span>
                    {channel?.channel_name.slice(0, 15)}
                  </p>
                </div>
                {/* <IconTrash
                  className="cursor-pointer mr-3"
                  size={16}
                  // onClick={() => handleDelete(channel.id)}
                /> */}
              </Group>
              <div className="ml-[2rem] mb-5">
                <List>
                  {channel.members && channel.members.length > 0 ? (
                    channel.members.map((member: Member, index: number) => (
                      <ListItem className="pt-2" key={index}>
                        {member.handle}
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>Empty</ListItem>
                  )}
                </List>
              </div>
            </div>
          ))
        ) : (
          <p>No voice channels available</p>
        )}
        {voiceError && (
          <p className="text-red-300">Voice channels failed to load</p>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );

  const VideoChannels = (
    <Accordion.Item key={channels[2].value} value={channels[2].value}>
      <Accordion.Control icon={channels[2].emoji}>
        {channels[2].value}
      </Accordion.Control>
      <Accordion.Panel>
        {text?.channels.map((channel: Channel) => (
          <p key={channel.channel_id}>{channel.channel_name}</p>
        ))}
      </Accordion.Panel>
    </Accordion.Item>
  );

  return (
    <>
      <nav className={`${classes.navbar} h-[94vh] overflow-y-auto`}>
        <Center
          className="flex flex-col items-center w-full relative"
          style={{
            backgroundImage: `url(${server?.serverBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "150px",
          }}
        >
          <div
            className={`absolute inset-0 ${
              server?.serverBanner ? "bg-black" : ""
            } bg-opacity-50`}
          />{" "}
          <div className="relative z-10 text-white">
            {" "}
            <div className="flex items-center mb-2">
              <Tooltip
                label={server?.serverName}
                position="top"
                transitionProps={{ duration: 0 }}
              >
                <h3 className="text-xl font-bold min-w-[84%]">
                  Server:{" "}
                  {server?.serverName
                    ? server.serverName.length > 10
                      ? server.serverName.slice(0, 10) + "..."
                      : server.serverName
                    : ""}
                </h3>
              </Tooltip>
              {auth?.user?.id === server?.ownerID && (
                <div className="flex items-center">
                  <Tooltip
                    label={"Server Settings"}
                    position="right"
                    transitionProps={{ duration: 0 }}
                  >
                    <IconSettings
                      size="1.3rem"
                      className="cursor-pointer hover:text-blue-300 active:text-blue-500 transition-colors ml-2"
                      onClick={() =>
                        navigate(`/server-settings/${server?.serverID}`)
                      }
                    />
                  </Tooltip>
                </div>
              )}
            </div>
            <Group justify="space-between">
              <Text>Code: {server?.serverCode}</Text>
              <Tooltip
                label={"Copy"}
                position="right"
                transitionProps={{ duration: 0 }}
              >
                <IconCopy
                  size="1.2rem"
                  className="cursor-pointer hover:text-blue-300 active:text-blue-500 transition-colors"
                  onClick={handleCopy}
                />
              </Tooltip>
            </Group>
          </div>
        </Center>

        <div className={classes.navbarMain}>
          <Divider variant="" className="w-[100%]" my="xs" />
          <div className="flex items-center mr-6 h-[3rem]">
            <Server
              serverID={null}
              icon={IconMessage2}
              label="Create Channel"
              onClick={open}
            />
            <h5 className="ml-1">Create Text Channel</h5>
          </div>
          <div className=" flex items-center mr-4 h-[3rem]">
            <Server
              serverID={null}
              icon={IconHeadphones}
              label="Create Channel"
              onClick={openVoiceModal}
            />
            <h5 className="ml-1">Create Voice Channel</h5>
          </div>
          <Accordion
            multiple
            variant="seperated"
            defaultValue={["Text"]}
            className="w-full"
          >
            {TextChannels}
            {VoiceChannels}
            {VideoChannels}
          </Accordion>
        </div>
      </nav>
      <CreateChannelModal
        serverID={server?.serverID}
        opened={opened}
        onClose={() => {
          close();
          setTimeout(() => setIsTextModal(true), 500);
        }}
        isText={isTextModal}
      />
      <audio ref={audioRef} src="/ding.wav"></audio>
    </>
  );
}
