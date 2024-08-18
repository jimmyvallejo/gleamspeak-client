import { Accordion, Center, UnstyledButton, rem, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHome2, IconPlus } from "@tabler/icons-react";
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
  const servers = useContext(ServerContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [active, setActive] = useState<number | null>(null);

  const api = useApi();
  const ws = useWebSocket();

  const queryClient = useQueryClient();

  const fetchUserTextChannels = async () => {
    try {
      const response = await api.get(`/v1/channels/${servers?.serverID}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user servers:", error);
      throw error;
    }
  };

  const handleChannel = (index: number, id: string) => {
    setActive(index);
    queryClient.invalidateQueries({ queryKey: ["channelMessages"] });
    ws.setTextRoom(id);
  };

  const { data, error } = useQuery({
    queryKey: ["userTextChannels", servers?.serverID],
    queryFn: fetchUserTextChannels,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!auth?.user && !!servers?.serverID,
  });

  useEffect(() => {
    setActive(null)
  },[servers?.serverID])

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
        <Center>
          <h3>{`Server: ${servers?.serverName}`}</h3>
        </Center>

        <div className={classes.navbarMain}>
          <Divider className="w-full" my="sm" />
          <div className="mb-4 flex items-center mr-5">
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
        serverID={servers?.serverID}
        opened={opened}
        onClose={close}
      />
    </>
  );
}
