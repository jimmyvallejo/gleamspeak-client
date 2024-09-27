import {
  Accordion,
  Center,
  UnstyledButton,
  rem,
  Divider,
  Text,
  Group,
  Tooltip
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome2,
  IconPlus,
  IconCopy,
  IconSettings,
} from "@tabler/icons-react";
import classes from "./Channel.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import { ServerContext } from "../../../contexts/ServerContext";
import { useContext, useState, useEffect } from "react";
import { CreateTextChannel } from "../modals/CreateTextChannelModa";
import { useApi } from "../../../hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useWebSocket } from "../../../hooks/useWebsocket";
import { useQueryClient } from "@tanstack/react-query";
import { copyToClipboard } from "../../../utils/copy";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

interface NavbarChannelProps {
  icon: typeof IconHome2;
  label: string;
  onClick?(): void;
  serverID: string | null;
  active?: boolean;
}

type channel = {
  channel_id: string;
  owner_id: string;
  server_id: string;
  language_id: string;
  channel_name: string;
  last_active: string;
  is_locked: boolean;
  channel_created_at: string;
  channel_updated_at: string;
};

const channels = [
  {
    emoji: "💬",
    value: "Text",
    description:
      "Crisp and refreshing fruit. Apples are known for their versatility and nutritional benefits. They come in a variety of flavors and are great for snacking, baking, or adding to salads.",
  },
  {
    emoji: "🔊",
    value: "Voice",
    description:
      "Naturally sweet and potassium-rich fruit. Bananas are a popular choice for their energy-boosting properties and can be enjoyed as a quick snack, added to smoothies, or used in baking.",
  },
  {
    emoji: "🔴",
    value: "Video",
    description:
      "Nutrient-packed green vegetable. Broccoli is packed with vitamins, minerals, and fiber. It has a distinct flavor and can be enjoyed steamed, roasted, or added to stir-fries.",
  },
];

function Server({ icon: Icon, onClick, active }: NavbarChannelProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      className={classes.link}
      data-active={active || undefined}
    >
      <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
    </UnstyledButton>
  );
}

export function Channels() {
  const auth = useContext(AuthContext);
  const server = useContext(ServerContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [active, setActive] = useState<number | null>(null);

  const navigate = useNavigate();

  const api = useApi();
  const ws = useWebSocket();

  const queryClient = useQueryClient();

  const fetchUserTextChannels = async () => {
    try {
      const response = await api.get(`/v1/channels/${server?.serverID}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user servers:", error);
      throw error;
    }
  };

  const { data, error } = useQuery({
    queryKey: ["userTextChannels", server?.serverID],
    queryFn: fetchUserTextChannels,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!auth?.user && !!server?.serverID,
  });

  const handleChannel = (index: number, id: string) => {
    setActive(index);
    queryClient.invalidateQueries({ queryKey: ["channelMessages"] });
    ws.setTextRoom(id);
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

  useEffect(() => {
    setActive(null);
  }, [server?.serverID]);

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
        {data?.channels.map((channel: channel, index: number) => (
          <Link
            key={channel.channel_id}
            className="no-underline text-inherit w-full"
            to={`/chat/${channel.channel_id}`}
          >
            <div
              onClick={() => handleChannel(index, channel.channel_id)}
              className={`rounded-md ${active === index ? "bg-[#262626]" : ""}`}
            >
              <p className="text-[17px] px-4 py-1">
                {" "}
                # {channel.channel_name.slice(0, 15)}
              </p>
            </div>
          </Link>
        ))}
        {error && <p className="text-red-300">Text channels failed to load</p>}
      </Accordion.Panel>
    </Accordion.Item>
  );
  const VoiceChannels = (
    <Accordion.Item key={channels[1].value} value={channels[1].value}>
      <Accordion.Control icon={channels[1].emoji}>
        {channels[1].value}
      </Accordion.Control>
      <Accordion.Panel>
        {data?.channels.map((channel: channel) => (
          <p key={channel.channel_id}>{channel.channel_name}</p>
        ))}
      </Accordion.Panel>
    </Accordion.Item>
  );

  const VideoChannels = (
    <Accordion.Item key={channels[2].value} value={channels[2].value}>
      <Accordion.Control icon={channels[2].emoji}>
        {channels[2].value}
      </Accordion.Control>
      <Accordion.Panel>
        {data?.channels.map((channel: channel) => (
          <p key={channel.channel_id}>{channel.channel_name}</p>
        ))}
      </Accordion.Panel>
    </Accordion.Item>
  );

  return (
    <>
      <nav className={classes.navbar}>
        <Center
          className="flex flex-col items-center w-full relative"
          style={{
            backgroundImage: `url(${server?.serverBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "150px", 
          }}
        >
          <div className={`absolute inset-0 ${server?.serverBanner ? "bg-black" : ""} bg-opacity-50`} />{" "}
          <div className="relative z-10 text-white">
            {" "}
            <div className="flex items-center mb-2">
            <Tooltip label={server?.serverName} position="top" transitionProps={{ duration: 0 }}>
              <h3 className="text-xl font-bold min-w-[84%]">
                Server: {server?.serverName
                  ? server.serverName.length > 10
                    ? server.serverName.slice(0, 10) + "..."
                    : server.serverName
                  : ""}
              </h3>
              </Tooltip>
              {auth?.user?.id === server?.ownerID && (
                <div className="flex items-center">
                 <Tooltip label={"Server Settings"} position="right" transitionProps={{ duration: 0 }}>
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
              <Tooltip label={"Copy"} position="right" transitionProps={{ duration: 0 }}>
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
          <div className=" flex items-center mr-5">
            <Server
              serverID={null}
              icon={IconPlus}
              label="Create Channel"
              onClick={open}
            />
            <h5 className="ml-1">Create Text Channel</h5>
          </div>
          <Accordion variant="seperated" defaultValue="Text" className="w-full">
            {TextChannels}
            {VoiceChannels}
            {VideoChannels}
          </Accordion>
        </div>
      </nav>
      <CreateTextChannel
        serverID={server?.serverID}
        opened={opened}
        onClose={close}
      />
    </>
  );
}
