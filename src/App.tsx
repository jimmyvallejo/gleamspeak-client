import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useMantineColorScheme } from "@mantine/core";
import { useEffect, useContext } from "react";

import { Home } from "./pages/Home";
import Login from "./pages/Login";
import ProtectedIn from "./components/global/routes/ProtectedIn";
import ProtectedServer from "./components/global/routes/ProtectedServer";
import { AuthContext } from "./contexts/AuthContext";
import { Servers } from "./components/global/navbars/Servers";
import { Chat } from "./pages/Chat";
import Settings from "./pages/Settings";
import ServerSettings from "./pages/ServerSettings";
import { Channels } from "./components/global/navbars/Channels";
import { HeaderSimple } from "./components/global/navbars/Header";
import { useServer } from "./hooks/useServer";

function App() {
  const { setColorScheme } = useMantineColorScheme();
  const auth = useContext(AuthContext);
  const { server } = useServer()

  useEffect(() => {
    setColorScheme("dark");
  }, []);

  return (
    <div className="App">
      <HeaderSimple />
      <div className="main-container">
        {auth?.user && (
          <>
            <Servers />
            {server?.server_id && <Channels />}
          </>
        )}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              element={
                <ProtectedIn
                  isAuthenticated={!auth?.isAuthenticated}
                  redirectPath="/auth"
                />
              }
            >
              <Route path="/chat/:channelId" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                element={
                  <ProtectedServer
                    isOwner={auth?.user?.id === server?.owner_id}
                    redirectPath="/"
                  />
                }
              >
                <Route path="/server-settings/:serverId" element={<ServerSettings />} />
              </Route>
            </Route>
            <Route
              element={
                <ProtectedIn
                  isAuthenticated={auth?.isAuthenticated}
                  redirectPath="/"
                />
              }
            >
              <Route path="/auth" element={<Login />} />
            </Route>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;