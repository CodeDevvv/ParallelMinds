import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Layout from './components/auth/UserAuth/Layout';
import UserLayout from './components/UserRole/UserLayout';
import Events from './components/UserRole/components/Events';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Support from './components/UserRole/components/Support';
import Profile from './components/UserRole/components/Profile';
import Community from './components/UserRole/components/Community';
import UserQuestionnaire from './components/auth/UserQuestionaire';
import DoctorAuthLayout from './components/auth/DoctorAuth/Layout';
import UserDashboard from './components/UserRole/components/Dashboard';


function ScrollToTopHandler() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopHandler />
      <Toaster />

      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/auth/doctor" element={<DoctorAuthLayout />} />
        <Route path="/questionnaire" element={<UserQuestionnaire />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/user/*" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path='support' element={<Support />} />
            <Route path='events' element={<Events />} />
            <Route path='profile' element={<Profile />} />
            <Route path='community' element={<Community />} />
          </Route>
          {/* <Route path="/doctor/*" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboard />} />
          </Route> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
