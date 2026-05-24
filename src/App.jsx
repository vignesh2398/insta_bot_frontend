import LoginPage from './components/LoginPage'
import { Routes, Route } from "react-router-dom";
function App() {

  return (
  <>
        <Routes>
      <Route path="/" element={<LoginPage />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  </>
  )
}

export default App
