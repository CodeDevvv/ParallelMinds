import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

import {  useLoading } from '../../../store.js';
import config from '../../../config.js';

const Login = ({ onToggleMode }) => {
  const navigate = useNavigate();
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
      const response = await axios.post(`${config.API_URL}/api/auth/userlogin`, formData, { withCredentials: true });
      const { status, message } = response.data;

      if (status) {
        navigate("/user", { replace: true });
      } else {
        toast.error(message);
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-[#B8B8B8]">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent transition-all duration-200"
            required
            autoComplete='off'
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
            className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-12 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B8B8] hover:text-[#4F8CFF] transition-colors"
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
          className="w-full bg-gradient-to-r from-[#4F8CFF] to-[#7B68EE] text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Sign In
        </button>
      </form>
      <div className="text-center">
        <p className="text-[#B8B8B8] text-sm">
          Don&apos;t have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-[#4F8CFF] hover:text-[#7B68EE] hover:underline transition-colors font-medium"
          >
            Register now
          </button>
        </p>
      </div>
    </div>
  );
};


Login.propTypes = {
  onToggleMode: PropTypes.func.isRequired,
};

export default Login;
