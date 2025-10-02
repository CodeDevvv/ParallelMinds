
// ===============================================================================================================================================
//                                               Under development
// ===============================================================================================================================================

import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  CalendarDaysIcon,
  MapPinIcon,
  IdentificationIcon,
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuthStore, useLoading } from '../../../store.js';
import PropTypes from 'prop-types';
import config from '../../../config.js';

const DoctorRegister = ({ onToggleMode }) => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setIsLoading } = useLoading();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: null,
    city: '',
    licenseNumber: '',
    specialization: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dob: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${config.API_URL}/api/auth/doctorregister`, formData);
      const { status, token, message } = response.data;
      
      if (status) {
        toast.success("Registration successful! Welcome to our network.");
        await setAuth(token, "Doctor");
        navigate("/doctor/DoctorDashboard");
      } else {
        toast.error(message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name (Dr. John Smith)"
            className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200"
            required
          />
        </div>

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
          <CalendarDaysIcon className="w-5 h-5 absolute left-3 top-3 text-[#B8B8B8] z-10" />
          <DatePicker
            selected={formData.dob}
            onChange={handleDateChange}
            placeholderText="Date of Birth"
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            showMonthDropdown
            dropdownMode="select"
            className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MapPinIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div className="relative">
            <IdentificationIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="Medical License Number"
              className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>

        <div className="relative">
          <AcademicCapIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Select Specialization</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Gynecology">Gynecology</option>
            <option value="Oncology">Oncology</option>
            <option value="Radiology">Radiology</option>
            <option value="Anesthesiology">Anesthesiology</option>
            <option value="Emergency Medicine">Emergency Medicine</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="relative">
          <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Secure Password"
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
          <AcademicCapIcon className="w-5 h-5" />
          <span>Join Medical Network</span>
        </button>
      </form>

      <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg p-4">
        <p className="text-[#F59E0B] text-sm text-center">
          <strong>Verification Required:</strong> All applications are subject to credential verification before approval.
        </p>
      </div>

      <div className="text-center">
        <p className="text-[#B8B8B8] text-sm">
          Already registered?{' '}
          <button
            onClick={onToggleMode}
            className="text-[#10B981] hover:text-[#059669] hover:underline transition-colors font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};
DoctorRegister.propTypes = {
    onToggleMode: PropTypes.func.isRequired,
};

export default DoctorRegister;
