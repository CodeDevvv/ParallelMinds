
// ===============================================================================================================================================
//                                               Under development
// ===============================================================================================================================================


import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon
} from '@heroicons/react/24/outline';  
import { useAuthStore, useLoading } from '../../../store.js';
import PropTypes from 'prop-types';
import config from '../../../config.js';


const DoctorLogin = ({ onToggleMode }) => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setIsLoading } = useLoading();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${config.API_URL}/api/auth/doctorlogin`, formData);
      const { status, token, message } = response.data;
      
      if (status) {
        toast.success("Logged In Successfully!");
        await setAuth(token, "Doctor");
        navigate("/doctor/DoctorDashboard");
      } else {
        toast.error(message || "Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Professional Email"
            className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div className="relative">
          <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-12 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B8B8] hover:text-[#10B981] transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <UserIcon className="w-5 h-5" />
          <span>Access Dashboard</span>
        </button>
      </form>

      <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-4">
        <p className="text-[#10B981] text-sm text-center">
          <strong>Professional Access:</strong> This portal is exclusively for licensed medical practitioners.
        </p>
      </div>

      <div className="text-center">
        <p className="text-[#B8B8B8] text-sm">
          Not registered with our network?{' '}
          <button
            onClick={onToggleMode}
            className="text-[#10B981] hover:text-[#059669] hover:underline transition-colors font-medium"
          >
            Apply for access
          </button>
        </p>
      </div>
    </div>
  );
};

DoctorLogin.propTypes = {
    onToggleMode: PropTypes.func.isRequired,
};

export default DoctorLogin;
