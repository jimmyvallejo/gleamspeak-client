import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ServerProvider } from "./contexts/ServerContext.tsx";
import { WebSocketProvider } from "./contexts/WebSocketContext.tsx";
import App from "./App.tsx";
import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <MantineProvider defaultColorScheme="dark">
        <Notifications />
        <AuthProvider>
          <WebSocketProvider>
            <ServerProvider>
              <App />
            </ServerProvider>
          </WebSocketProvider>
        </AuthProvider>
      </MantineProvider>
    </Router>
  </QueryClientProvider>
);
