import { useToggle, upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
} from "@mantine/core";
import { GoogleButton } from "../buttons/Google";
import { TwitterButton } from "../buttons/Twitter";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function AuthenticationForm(props: PaperProps) {
  const auth = useContext(AuthContext);

  if (!auth) {
    console.log("Context not loaded");
  }

  const navigate = useNavigate();

  const [type, toggle] = useToggle(["login", "register"]);

  const form = useForm({
    initialValues: {
      email: "",
      handle: "",
      password: "",
      terms: false,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      handle: (val) => {
        if (type === "register" && (!val || val.trim() === "")) {
          return "Display name is required";
        }
        return null;
      },
      password: (val) =>
        val.length < 3 ? "Password should include at least 3 characters" : null,
      terms: (val) => {
        if (type === "register" && !val) {
          return "You must accept the terms and conditions";
        }
        return null;
      },
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      if (!auth) throw new Error("Auth context not available");
      await auth.loginStandard(email, password);
    },
    onSuccess: () => {
      console.log("Login successful");
      navigate("/");
    },
    onError: (error) => {
      console.error("Login failed:", error);
      form.setErrors({ email: "Login failed. Please check your credentials." });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({
      email,
      handle,
      password,
    }: {
      email: string;
      handle: string;
      password: string;
    }) => {
      if (!auth) throw new Error("Auth context not available");
      await auth.createStandard(email, handle, password);
    },
    onSuccess: () => {
      console.log("Creation and login successful");
      navigate("/");
    },
    onError: (error) => {
      console.error("Creation failed:", error);
      form.setErrors({
        email: "Creation failed. Please check your credentials.",
      });
    },
  });

  const handleLogin = form.onSubmit((values) => {
    if (form.validate().hasErrors) {
      return;
    }
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  });

  const handleSignup = form.onSubmit((values) => {
    if (form.validate().hasErrors) {
      return;
    }
    signupMutation.mutate({
      email: values.email,
      handle: values.handle,
      password: values.password,
    });
  });

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" fw={500}>
        Welcome to Gleamspeak
      </Text>

      <Group grow mb="md" mt="md">
        <GoogleButton radius="xl">Google</GoogleButton>
        <TwitterButton radius="xl">Twitter</TwitterButton>
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <form onSubmit={type === "login" ? handleLogin : handleSignup}>
        <Stack>
          {type === "register" && (
            <TextInput
              required
              label="Display Name"
              placeholder="Your Display name"
              value={form.values.handle}
              onChange={(event) =>
                form.setFieldValue("handle", event.currentTarget.value)
              }
              error={form.errors.handle}
              radius="md"
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="hello@gleamspeak.com"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email && "Invalid email"}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
            radius="md"
          />

          {type === "register" && (
            <Checkbox
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) =>
                form.setFieldValue("terms", event.currentTarget.checked)
              }
              error={form.errors.terms}
            />
          )}
        </Stack>

        <Group justify="space-between" mt="xl">
          <Anchor
            component="button"
            type="button"
            c="dimmed"
            onClick={() => toggle()}
            size="xs"
          >
            {type === "register"
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" radius="xl">
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
