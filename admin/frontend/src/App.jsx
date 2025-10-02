import { Toaster } from "react-hot-toast"
import { Route, Routes } from "react-router-dom"
import Authentication from "./components/auth/Authentication"
import ProtectRoutes from "./components/ProtectRoutes"
import AdminDashboard from "./components/adminDashboard/Dashboard"
import EventDashboard from "./components/eventDashboard/Dashboard"
import AccountDashboard from "./components/accountDashboard/Dashboard"
import SupportDashboard from "./components/supportDashboard/Dashboard"
import CommunityDashboard from "./components/communityDashboard/Dashboard"

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/authenticate" element={<Authentication />} />
        <Route element={<ProtectRoutes />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin/eventManagement" element={< EventDashboard />} />
          <Route path="/admin/userManagement" element={<AccountDashboard />} />
          <Route path="/admin/support" element={<SupportDashboard />} />
          <Route path="/admin/community" element={<CommunityDashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
