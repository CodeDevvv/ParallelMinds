import { Fragment, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  Squares2X2Icon,
  CalendarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ChevronUpDownIcon, // A nice icon for the user menu button
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useUserData } from "../utils/dataQuery";
import config from "../../../config";

// No changes to navItems array as requested
const navItems = [
  { label: "Dashboard", to: "/user", Icon: HomeIcon },
  { label: "Events", to: "/user/events", Icon: CalendarIcon },
  { label: "Community", to: "/user/community", Icon: Squares2X2Icon },
  { label: "Support", to: "/user/support", Icon: QuestionMarkCircleIcon },
  { label: "Profile", to: "/user/profile", Icon: UserCircleIcon },
];

const Sidebar = () => {
  const [open] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: userData } = useUserData();

  const handleLogout = () => {
    axios
      .get(`${config.API_URL}/api/auth/logout?role=User`, { withCredentials: true })
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          navigate("/");
          queryClient.clear();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Something went wrong!"));
  };

  // Updated styles for the dark theme
  const baseLinkClasses = "group flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ease-in-out";
  const activeLinkClasses = "bg-neutral-800 text-emerald-400 font-semibold";
  const idleLinkClasses = "text-neutral-400 hover:bg-neutral-800 hover:text-white";

  return (
    <aside
      className={`fixed top-0 left-0 h-full ${open ? "w-64" : "w-16"} 
                  bg-neutral-900 border-r border-neutral-800 flex flex-col z-50 transition-width duration-300`}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-800">
        <img src="/Logo1.png" alt="logo" className="h-8 w-8 rounded-full" />
        {open && (
          <span className="ml-3 font-bold text-lg text-emerald-400">
            ParallelMinds
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4 px-3 space-y-1.5">
        {navItems.map(({ label, to, Icon }) => (
          <NavLink 
            key={label} 
            to={to} 
            end
            className={({ isActive }) =>
              `${baseLinkClasses} ${isActive ? activeLinkClasses : idleLinkClasses}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {open && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer User Menu */}
      <div className="border-t border-neutral-800 p-3">
        <Menu as="div" className="relative">
          <Menu.Button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-neutral-800 transition-colors duration-200">
            <UserCircleIcon className="w-9 h-9 text-neutral-500 flex-shrink-0" />
            {open && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {userData?.full_name || "User"}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {userData?.email || "user@email.com"}
                </p>
              </div>
            )}
            {open && <ChevronUpDownIcon className="w-4 h-4 text-neutral-500" />}
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute left-0 bottom-full mb-2 w-full bg-neutral-800 border border-neutral-700 
                         rounded-lg shadow-lg focus:outline-none overflow-hidden"
            >
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left ${
                      active ? "bg-red-500/10 text-red-400" : "text-neutral-300"
                    } transition-colors duration-150`}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </aside>
  );
};

export default Sidebar;