import { useContext } from "react";
import { Tooltip, UnstyledButton, Stack, rem, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome2,
  IconUser,
  IconPlus,
  IconDoorEnter,
  IconSettings,
} from "@tabler/icons-react";

import classes from "./Server.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import { ServerContext } from "../../../contexts/ServerContext";
import { CreateServerModal } from "../modals/CreateServerModal";
import { JoinServerModal } from "../modals/JoinServerModal";
import { useApi } from "../../../hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "../../../hooks/useWebsocket";
import { useNavigate } from "react-router-dom";

interface NavbarServerProps {
  icon: typeof IconHome2 | string;
  image: string | undefined;
  label: string;
  onClick?(): void;
  serverID: string | null;
  active?: boolean;
}

type Server = {
  server_id: string;
  owner_id: string;
  server_name: string;
  description: string;
  icon_url: string;
  banner_url: string;
  is_public: boolean;
  member_count: number;
  invite_code: string;
  server_level: number;
  max_members: number;
  server_created_at: string;
  server_updated_at: string;
};

function ServerItem({
  icon: Icon,
  image,
  label,
  onClick,
  active,
}: NavbarServerProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        {Icon && (
          <Icon style={{ width: rem(23), height: rem(23) }} stroke={1.5} />
        )}
        {image && (
          <Image
            style={{ width: rem(30), height: rem(30) }}
            radius="xl"
            src={image}
          />
        )}
      </UnstyledButton>
    </Tooltip>
  );
}

export function Servers() {
  const auth = useContext(AuthContext);
  const servers = useContext(ServerContext);
  const navigate = useNavigate();

  const [
    createServerOpened,
    { open: openCreateServer, close: closeCreateServer },
  ] = useDisclosure(false);

  const [joinServerOpened, { open: openJoinServer, close: closeJoinServer }] =
    useDisclosure(false);

  const ws = useWebSocket();

  const { setChannelMessages } = ws;

  const api = useApi();

  const fetchUserServers = async () => {
    try {
      const response = await api.get("/v1/servers/user/many");
      return response.data;
    } catch (error) {
      console.error("Error fetching user servers:", error);
      throw error;
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userServers", auth?.user?.id],
    queryFn: fetchUserServers,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    enabled: !!auth?.user,
  });

  const handleServerChange = (server: Server) => {
    servers?.setServerID(server.server_id);
    servers?.setServerName(server.server_name);
    servers?.setServerCode(server.invite_code);
    servers?.setOwnerID(server.owner_id);
    servers?.setServerBanner(server.banner_url);
    setChannelMessages([]);
    navigate("/");
  };

  let content;
  if (isLoading) {
    content = <div className="text-center text-sm">Loading...</div>;
  } else if (isError) {
    content = (
      <div className="text-center text-sm">
        Error: {(error as Error).message}
      </div>
    );
  } else if (data?.servers) {
    content = (
      <Stack justify="center" gap={0}>
        {data.servers.map((server: Server) => (
          <ServerItem
            key={server.server_id}
            icon={!server.icon_url ? IconUser : ""}
            image={server.icon_url ? server.icon_url : ""}
            label={server.server_name}
            serverID={server.server_id}
            active={servers?.serverID === server.server_id}
            onClick={() => {
              handleServerChange(server);
            }}
          />
        ))}
      </Stack>
    );
  } else {
    content = <div className="text-center text-sm">No servers found</div>;
  }

  const borderClass = data?.length === 0 ? "border-r border-r-gray-300" : "";

  return (
    <>
      <nav className={`${classes.navbar} ${borderClass}`}>
        <div className={classes.navbarMain}>
          <div className="mb-4">
            <ServerItem
              serverID={null}
              icon={IconPlus}
              image=""
              label="Create Server"
              onClick={openCreateServer}
            />
            <ServerItem
              serverID={null}
              icon={IconDoorEnter}
              image=""
              label="Join Server"
              onClick={openJoinServer}
            />
          </div>
          {content}
        </div>
        <ServerItem
          serverID={null}
          icon={IconSettings}
          image=""
          label="Account Settings"
          onClick={() => navigate("/settings")}
        />
      </nav>
      <CreateServerModal
        opened={createServerOpened}
        onClose={closeCreateServer}
      />
      <JoinServerModal opened={joinServerOpened} onClose={closeJoinServer} />
    </>
  );
}
