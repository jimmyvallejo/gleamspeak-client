import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/global/navbar/Navbar";
import Home from "./pages/Home";
import { useMantineColorScheme } from "@mantine/core";
import { useEffect } from "react";

function App() {
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    setColorScheme("dark");
  }, []);
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="hello" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
