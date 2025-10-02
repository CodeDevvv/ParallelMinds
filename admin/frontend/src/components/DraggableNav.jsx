import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars4Icon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuthStore } from '../store/store';
import { motion as Motion, useDragControls } from 'framer-motion';

const DraggableNav = () => {
  const location = useLocation();
  const dragControls = useDragControls();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: HomeIcon, to: '/' },
    { id: 'events', label: 'Event Management', Icon: CalendarIcon, to: '/admin/eventManagement' },
    { id: 'community', label: 'Community', Icon: UserGroupIcon, to: '/admin/community' },
    { id: 'support', label: 'Support', Icon: QuestionMarkCircleIcon, to: '/admin/support' },
    { id: 'users', label: 'User Management', Icon: UsersIcon, to: '/admin/userManagement' },
  ];
  const { clearAuth, adminData } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <Motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragStart={() => document.body.classList.add('select-none')}
      onDragEnd={() => document.body.classList.remove('select-none')}

      style={{
        position: 'fixed',
        left: '50%',
        bottom: 20,
        x: '-50%',
      }}

      className="flex items-center gap-2 bg-neutral-900/70 backdrop-blur-md border border-neutral-700 rounded-full p-2 shadow-2xl z-50"
    >
      <div
        onPointerDown={(event) => dragControls.start(event)}
        className="cursor-grab p-3 [&:active]:cursor-grabbing"
        aria-label="Drag to move navigation"
      >
        <Bars4Icon className="h-6 w-6 text-neutral-500" />
      </div>

      {menuItems.map(({ id, label, Icon, to }) => {
        const isActive = location.pathname === to;
        return (
          <Link key={id} to={to} className={`relative group flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 ${isActive ? 'bg-white text-neutral-900' : 'text-neutral-400 hover:bg-neutral-800'}`}>
            {Icon && <Icon className="h-6 w-6" />}
            <span className="absolute bottom-full mb-3 whitespace-nowrap rounded-md bg-black px-3 py-1.5 text-xs text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none">{label}</span>
          </Link>
        );
      })}

      <div className="h-8 w-px bg-neutral-700 mx-2"></div>

      <Menu as="div" className="relative">
        <Menu.Button className="relative group flex items-center justify-center h-12 w-12 rounded-full text-neutral-400 hover:bg-neutral-800 transition-colors duration-300">
          <UserCircleIcon className="h-7 w-7" />
          <span className="absolute bottom-full mb-3 whitespace-nowrap rounded-md bg-black px-3 py-1.5 text-xs text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none">Profile</span>
        </Menu.Button>
        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
          <Menu.Items className="absolute right-0 bottom-full mb-2 w-56 origin-bottom-right rounded-md bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-neutral-700">
            <div className="p-1">
              <div className="px-3 py-2"><p className="text-sm font-semibold text-white truncate">{adminData?.name || "Admin"}</p><p className="text-sm truncate text-neutral-400">{adminData?.email || "admin@example.com"}</p></div>
              <div className="h-px bg-neutral-700 my-1"></div>
              <Menu.Item>{({ active }) => (<button onClick={handleLogout} className={`${active ? 'bg-red-500/10 text-red-400' : 'text-neutral-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}> <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" /> Logout </button>)}</Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </Motion.div>
  );
};

export default DraggableNav;