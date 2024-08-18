import { useContext, useEffect, useState } from "react";
import { Tooltip, UnstyledButton, Stack, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHome2, IconUser, IconPlus } from "@tabler/icons-react";

import classes from "./Server.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import { ServerContext } from "../../../contexts/ServerContext";
import { CreateServerModal } from "../modals/CreateServerModal";
import { useApi } from "../../../hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "../../../hooks/useWebsocket";

interface NavbarServerProps {
  icon: typeof IconHome2;
  label: string;
  onClick?(): void;
  serverID: string | null;
  active?: boolean;
}

type Server = {
  server_id: string;
  server_name: string;
  description: string;
  icon_url: string;
  banner_url: string;
  is_public: boolean;
  member_count: number;
  server_level: number;
  max_members: number;
  server_created_at: string;
  server_updated_at: string;
};

function Server({ icon: Icon, label, onClick, active }: NavbarServerProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

export function Servers() {
  const auth = useContext(AuthContext);
  const servers = useContext(ServerContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [active, setActive] = useState(0);

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
    queryKey: ["userServers"],
    queryFn: fetchUserServers,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!auth?.user,
  });

  const handleServerChange = (server: Server, index: number) => {
    servers?.setServerID(server.server_id);
    servers?.setServerName(server.server_name);
    setActive(index);
    setChannelMessages([]);
  };

  useEffect(() => {
    if (data?.servers.length > 0) {
      servers?.setServerID(data.servers[0].server_id);
      servers?.setServerName(data.servers[0].server_name);
      console.log(data);
    }
  }, [data]);

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
        {data.servers.map((server: Server, index: number) => (
          <Server
            key={server.server_id}
            icon={IconUser}
            label={server.server_name}
            serverID={server.server_id}
            active={index === active}
            onClick={() => {
              handleServerChange(server, index);
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
            <Server
              serverID={null}
              icon={IconPlus}
              label="Create Server"
              onClick={open}
            />
          </div>
          {content}
        </div>
      </nav>
      <CreateServerModal opened={opened} onClose={close} />
    </>
  );
}
