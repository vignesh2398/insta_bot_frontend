import { useEffect, useState } from "react";
import ConnectInstagram from "./components/ConnectInstagram";
import DashboardPage from "./components/Dashboard";
import Dashboardclaude from "./components/Dashboardclaude";
import LinkInstagram from "./components/LinkInstagram";
import LoginPage from "./components/LoginPage";
import { Routes, Route } from "react-router-dom";
import { subscribeLoading } from "./store/loadingStore";

function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeLoading(setLoading);
    return unsubscribe;
  }, []);

  return (
    <>
 {loading && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/70">
    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
)}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/connect-instagram" element={<ConnectInstagram />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboardclaude" element={< Dashboardclaude/>} />

        <Route path="/linkInstagram" element={<LinkInstagram />} />
      </Routes>
    </>
  );
}

export default App;