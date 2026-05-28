import ConnectInstagram from './components/ConnectInstagram';
import DashboardPage from './components/Dashboard';
import LinkInstagram from './components/LinkInstagram';
import LoginPage from './components/LoginPage'
import { Routes, Route } from "react-router-dom";
function App() {

  return (
  <>
        <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/connect-instagram" element={<ConnectInstagram />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/linkInstagram" element={<LinkInstagram />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  </>
  )
}

export default App
