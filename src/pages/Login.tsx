import { AuthenticationForm } from "../components/global/forms/AuthenticationForm";
import { Container, Paper } from "@mantine/core";

const Login = () => {
  return (
    <Container size="sm" my="xl">
      <Paper shadow="md" radius="md" p="xl">
        <AuthenticationForm />
      </Paper>
    </Container>
  );
};

export default Login;
