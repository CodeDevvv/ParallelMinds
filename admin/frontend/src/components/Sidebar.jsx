import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

import Logo from "../assets/Logo1.png";
import { useAuthStore } from '../store/store';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: HomeIcon, to: '/' },
    { id: 'events', label: 'Event Management', Icon: CalendarIcon, to: '/events' },
    { id: 'community', label: 'Community', Icon: UserGroupIcon, to: '/community' },
    { id: 'support', label: 'Support', Icon: QuestionMarkCircleIcon, to: '/support' },
    { id: 'users', label: 'User Management', Icon: UsersIcon, to: '/users' },
  ];
  const { clearAuth, adminData } = useAuthStore()

  const handleLogout = () => {
    console.log("Logout action triggered");
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-neutral-950 border-r border-neutral-800 z-50 flex flex-col">

      <div className="flex items-center h-16 px-4 border-b border-neutral-800 flex-shrink-0">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          <img src={Logo} alt="Logo" />
        </div>
        <div className="ml-3">
          <div className="text-white font-semibold text-sm">ParallelMinds</div>
          <div className="text-gray-400 text-xs">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-grow mt-4 px-3 space-y-1.5">
        <ul>
          {menuItems.map(({ id, label, Icon, to }) => {
            const isActive = location.pathname === to;

            const linkClasses = `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group`;
            const activeClasses = 'bg-neutral-700/60 text-white font-semibold';
            const idleClasses = 'text-gray-400 hover:bg-neutral-800/80 hover:text-white';

            return (
              <li key={id}>
                <Link
                  to={to}
                  className={`${linkClasses} ${isActive ? activeClasses : idleClasses}`}
                >
                  {Icon &&
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}
                      aria-hidden="true"
                    />
                  }
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-4 text-left hover:bg-neutral-900 transition-colors duration-200 group"
        >
          <UserCircleIcon className="w-9 h-9 flex-shrink-0 text-neutral-500 group-hover:text-white transition-colors" />
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-white">{adminData.name || "Admin"}</p>
            <p className="text-xs text-neutral-400"
              onClick={clearAuth}
            >Logout</p>
          </div>
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-neutral-500 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;