import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import {
  Paper,
  Text,
  Title,
  Button,
  useMantineTheme,
  rem,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import classes from "./RecentServers.module.css";
import { user } from "../../../contexts/AuthContext";
import { notifications } from "@mantine/notifications";

interface CardProps {
  id: string;
  banner: string | undefined;
  description: string;
  serverName: string;
  owner: string;
  memberCount: string;
  user: user | null | undefined;
}

const Card = ({
  id,
  banner,
  serverName,
  owner,
  memberCount,
  description,
  user,
}: CardProps) => {
  const DEFAULT_IMAGE = "/triangles.webp";
  const backgroundImage = `url(${banner || DEFAULT_IMAGE})`;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const api = useApi();

  const createServerMutation = useMutation({
    mutationFn: async ({ server_id }: { server_id: string }) => {
      if (!user) throw new Error("Auth context not available");
      const data = {
        server_id: server_id,
      };
      const response = await api.post(`/v1/servers/join`, data);
      return response.data;
    },
    onSuccess: () => {
      notifications.show({
        message: "Server Join Successful",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["userServers"] });
      queryClient.invalidateQueries({ queryKey: ["recentServers"] });
    },
    onError: (error: Error) => {
      console.error("Server join failed:", error);
      notifications.show({ message: "Already a member of this server", color: "red" });
    },
  });

  const handleClick = () => {
    createServerMutation.mutate({
      server_id: id,
    });
  };

  const handleNavigate = () => {
    navigate("/auth");
  };

  return (
    <Paper
      shadow="md"
      p="xl"
      w="100%"
      radius="md"
      style={{
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      className={classes.card}
    >
      <div className=" ml-2 bg-[#343a40] px-5 py-2 rounded-lg">
        <Text className={classes.category} size="s">
          Owner: {owner}
        </Text>
        <Title order={3} className={classes.title}>
          Server Name: {serverName}
        </Title>
        <Text className={classes.description} size="s">
          Description: {description ? description : "No description yet"}
        </Text>
      </div>
      <div className="self-end flex flex-col items-center mr-4 mt-3">
        <Button
          onClick={user ? handleClick : handleNavigate}
          variant="filled"
          color="gray"
          style={{ marginBottom: "3px" }}
        >
          Join Server
        </Button>
        {/* <Text size="sm" className={classes.description}>
          Members: {memberCount}
        </Text> */}
      </div>
    </Paper>
  );
};

export const RecentServerCarousel = () => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const auth = useContext(AuthContext);
  const api = useApi();

  const fetchRecentServers = async () => {
    try {
      const response = await api.get("/v1/servers/recent");
      return response.data;
    } catch (error) {
      console.error("Error fetching user servers:", error);
      throw error;
    }
  };
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recentServers"],
    queryFn: fetchRecentServers,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, 
  });


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const serverData = Array.isArray(data) ? data : [];

  const slides = serverData.map((item) => (
    <Carousel.Slide key={item.server_id}>
      <Card
        id={item?.server_id}
        banner={item?.banner_url}
        serverName={item?.server_name}
        owner={item?.owner_handle}
        memberCount={item?.member_count}
        description={item?.description}
        user={auth?.user}
      />
    </Carousel.Slide>
  ));

  return (
    <div className="w-full">
      <Carousel
        slideSize={{ base: "100%", sm: "50%" }}
        slideGap={{ base: rem(2), sm: "xl" }}
        align="start"
        slidesToScroll={mobile ? 1 : 2}
      >
        {slides}
      </Carousel>
    </div>
  );
};
