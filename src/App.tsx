import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useMantineColorScheme } from "@mantine/core";
import { useEffect, useContext } from "react";
import { Navbar } from "./components/global/navbar/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedIn from "./components/global/routes/ProtectedIn";
import { AuthContext } from "./contexts/AuthContext";

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
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            element={
              <ProtectedIn
                isAuthenticated={auth?.isAuthenticated}
                redirectPath="/"
              />
            }
          >
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
