import {
  Accordion,
  Center,
  UnstyledButton,
  rem,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHome2, IconPlus } from "@tabler/icons-react";
import classes from "./Channel.module.css";
// import { AuthContext } from "../../../contexts/AuthContext";
import { ServerContext } from "../../../contexts/ServerContext";
import { CreateServerModal } from "../modals/CreateServerModal";
import { useContext } from "react";
// import { useApi } from "../../../hooks/useApi";
// import { useQuery } from "@tanstack/react-query";

interface NavbarChannelProps {
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
  //   const auth = useContext(AuthContext);
  const servers = useContext(ServerContext);
  const [opened, { open, close }] = useDisclosure(false);
  //   const [active, setActive] = useState(0);

  //   const api = useApi();

  //   const fetchUserServers = async () => {
  //     try {
  //       const response = await api.get("/v1/servers/user/many");
  //       return response.data;
  //     } catch (error) {
  //       console.error("Error fetching user servers:", error);
  //       throw error;
  //     }
  //   };

  //   const { data, isLoading, isError, error } = useQuery({
  //     queryKey: ["userServers"],
  //     queryFn: fetchUserServers,
  //     staleTime: Infinity,
  //     gcTime: Infinity,
  //     retry: 3,
  //     retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  //     enabled: !!auth?.user,
  //   });

  //   useEffect(() => {
  //     if (data?.servers.length > 0) {
  //       servers?.setServerID(data.servers[0].server_id);
  //     }
  //   }, [data]);

  //   let content;
  //   if (isLoading) {
  //     content = <div className="text-center text-sm">Loading...</div>;
  //   } else if (isError) {
  //     content = (
  //       <div className="text-center text-sm">
  //         Error: {(error as Error).message}
  //       </div>
  //     );
  //   } else if (data?.servers) {
  //     content = (
  //       <Stack justify="center" gap={0}>
  //         {data.servers.map((server: Server, index: number) => (
  //           <Server
  //             key={server.server_id}
  //             icon={IconUser}
  //             label={server.server_name}
  //             serverID={server.server_id}
  //             active={index === active}
  //             onClick={() => {
  //               servers?.setServerID(server.server_id);
  //               setActive(index);
  //             }}
  //           />
  //         ))}
  //       </Stack>
  //     );
  //   } else {
  //     content = <div className="text-center text-sm">No servers found</div>;
  //   }

  const items = channels.map((item) => (
    <Accordion.Item key={item.value} value={item.value}>
      <Accordion.Control icon={item.emoji}>{item.value}</Accordion.Control>
      <Accordion.Panel>{item.description}</Accordion.Panel>
    </Accordion.Item>
  ));

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
          <Accordion variant="seperated" defaultValue="Text" className="w-full">{items}</Accordion>
        </div>
      </nav>
      <CreateServerModal opened={opened} onClose={close} />
    </>
  );
}
