import { Container, Text, Loader, Alert, Center } from "@mantine/core";
import { ServerCard } from "../components/global/cards/ServerCard";
import { ServerSettingsForm } from "../components/global/forms/ServerSettingsForm";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";

const ServerSettings = () => {
  const auth = useContext(AuthContext);
  const api = useApi();

  const { serverId } = useParams();

  const fetchServerInformation = async () => {
    try {
      const response = await api.get(`/v1/servers/${serverId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user information:", error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["serverSettings", serverId],
    queryFn: fetchServerInformation,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!auth?.user,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <Container size="sm" my="xl">
        <Center>
          <Loader size="lg" />
        </Center>
        <Text ta="center" mt="md">
          Loading server information...
        </Text>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size="sm" my="xl">
        <Alert title="Error" color="red">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      className="flex flex-col  justify-center overflow-y-auto pt-[5rem] "
      size={"50%"}
      style={{
        height: "800px",
      }}
    >
      <ServerCard
        serverID={serverId}
        bannerUrl={data?.banner_url}
        iconUrl={data?.icon_url}
        serverName={data?.server_name}
        memberCount={data?.member_count}
      />
      <ServerSettingsForm
        serverID={serverId}
        serverName={data?.server_name}
        description={data?.description}
        refetch={refetch}
      />
    </Container>
  );
};

export default ServerSettings;
