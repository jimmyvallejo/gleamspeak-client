import { Container, Text, Loader, Alert, Center } from "@mantine/core";
import { UserCard } from "../components/global/cards/UserCard";
import { SettingsForm } from "../components/global/forms/SettingsForm";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";

const Settings = () => {
  const auth = useContext(AuthContext);
  const api = useApi();

  const fetchUserInformation = async () => {
    try {
      const response = await api.get(`/v1/users/auth`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user information:", error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["userSettings"],
    queryFn: fetchUserInformation,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!auth?.user,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  console.log(data);

  if (isLoading) {
    return (
      <Container size="sm" my="xl">
        <Center>
          <Loader size="lg" />
        </Center>
        <Text ta="center" mt="md">
          Loading user information...
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
      className="flex flex-col  justify-center overflow-y-auto pt-[10rem]" 
      size={"50%"}
      style={{
        height: "800px",
      }}
    >
      <UserCard
        source={data?.avatar_url}
        handle={data?.handle}
        firstName={data?.first_name}
        lastName={data?.last_name}
        email={data?.email}
      />
      <SettingsForm
        id={data?.id}
        firstName={data?.first_name}
        lastName={data?.last_name}
        email={data?.email}
        handle={data?.handle}
        bio={data?.bio}
        refetch={refetch}
      />
 
    </Container>
  );
};

export default Settings;
