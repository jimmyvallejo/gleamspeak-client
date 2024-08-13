import { useContext } from "react";
import { Center, Tooltip, UnstyledButton, Stack, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHome2, IconUser, IconPlus } from "@tabler/icons-react";
import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./Channel.module.css";

import { AuthContext } from "../../../contexts/AuthContext";
import { CreateServerModal } from "../modals/CreateServerModal";
import { useApi } from "../../../hooks/useApi";
import { useQuery } from "@tanstack/react-query";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  onClick?(): void;
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

function Server({ icon: Icon, label, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link}>
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

export function Channels() {
  const auth = useContext(AuthContext);
  const [opened, { open, close }] = useDisclosure(false);
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

  console.log("Servers:", data);

  let content;
  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (isError) {
    content = <div>Error: {(error as Error).message}</div>;
  } else if (data?.servers) {
    content = (
      <Stack justify="center" gap={0}>
        {data.servers.map((server: Server) => (
          <Server
            key={server.server_id}
            icon={IconUser}
            label={server.server_name}
          />
        ))}
      </Stack>
    );
  } else {
    content = <div>No servers found</div>;
  }

  return (
    <>
      <nav className={classes.navbar}>
        <Center>
          <MantineLogo type="mark" size={0} />
        </Center>

        <div className={classes.navbarMain}>
          <div className="mb-4">
            <Server icon={IconPlus} label="Create Server" onClick={open} />
          </div>
          {content}
        </div>
      </nav>
      <CreateServerModal opened={opened} onClose={close} />
    </>
  );
}
