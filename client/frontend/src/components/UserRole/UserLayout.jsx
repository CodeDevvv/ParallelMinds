import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div>
      <Sidebar />
      <Outlet />
    </div>
  )
}

export default UserLayout