import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useMantineColorScheme } from "@mantine/core";
import { useEffect, useContext } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedIn from "./components/global/routes/ProtectedIn";
import { AuthContext } from "./contexts/AuthContext";
import { Servers } from "./components/global/navbars/Servers";
import { Chat } from "./pages/Chat";
import { Channels } from "./components/global/navbars/Channels";
import { HeaderSimple } from "./components/global/navbars/Header";

function App() {
  const { setColorScheme } = useMantineColorScheme();
  const auth = useContext(AuthContext);

  if (!auth) {
    console.log("Context not loaded");
  }

  useEffect(() => {
    setColorScheme("dark");
  }, []);

  return (
    <div className="App">
      <HeaderSimple />
      <div className="main-container">
        <Servers />
        <Channels />
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
