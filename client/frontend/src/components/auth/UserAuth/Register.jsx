import axios from 'axios';
import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';

import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from '@geoapify/react-geocoder-autocomplete';
import 'react-datepicker/dist/react-datepicker.css';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    CalendarDaysIcon,
    MapPinIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

import {  useLoading } from '../../../store.js';
import { schema } from '../../../utils/ValidationSchema.js';
import config from '../../../config.js';

const Register = ({ onToggleMode }) => {
    const navigate = useNavigate();
    const { setIsLoading } = useLoading();
    const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: null,
        gender: '',
        location: { city: '', state: '', country: '', place_id: '', address: '', latitude: '', longitude: '' },
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        const dob = new Date(date);
        const formattedDate = dob.toISOString().split('T')[0];

        setFormData(prev => ({ ...prev, dob: formattedDate }));
    };

    const onPlaceSelect = (value) => {
        setFormData(prev => ({
            ...prev,
            location: {
                city: value?.properties?.city || '',
                state: value?.properties?.state || '',
                country: value?.properties?.country || '',
                place_id: value?.properties?.place_id || '',
                address: value?.properties?.formatted || '',
                longitude: value?.properties?.lon || '',
                latitude: value?.properties?.lat || ''
            }
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate form data
            await schema.validate(formData, { abortEarly: false });
            const response = await axios.post(`${config.API_URL}/api/auth/userregister`, formData, { withCredentials: true });
            const { status, message } = response.data;

            if (status) {
                toast.success(message);
                navigate('/questionnaire', { replace: true });
            } else {
                toast.error(message);
            }
        } catch (error) {
            if (error.inner) {
                error.inner.forEach(e => toast.error(e.message));
            } else {
                console.error(error);
                toast.error("Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-[#B8B8B8]">Join us today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent transition-all duration-200"
                        required
                        autoComplete='off'
                    />
                </div>

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

                <div className='flex items-center justify-between mr-3 w-full'>
                    <div className="relative w-full">
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
                            className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                    <div className="relative w-full ml-3">
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full h-full bg-[#2A2A2A] border border-[#404040] rounded-lg px-4 py-[14px] text-white focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent transition-all duration-200"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="relative">
                    <MapPinIcon className="w-5 h-5 absolute left-3 top-3 text-[#B8B8B8] z-10" />
                    <div className="">
                        <GeoapifyContext apiKey={GEOAPIFY_API_KEY}>
                            <GeoapifyGeocoderAutocomplete
                                placeholder="Enter your address"
                                type="street"
                                countryCodes={["IN"]}
                                limit={4}
                                placeSelect={onPlaceSelect}
                                value={formData.location.address}
                                filterByCircle={{
                                    lon: 77.59117744417836,
                                    lat: 12.985218420238013,
                                    radiusMeters: 60000
                                }}
                                className="w-full bg-[#2A2A2A] border border-[#404040] rounded-lg pr-4 py-3 text-white placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent transition-all duration-200"
                            />
                        </GeoapifyContext>
                    </div>
                </div>

                <div className="relative">
                    <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Set Password"
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
                    Create Account
                </button>
            </form>

            <div className="text-center">
                <p className="text-[#B8B8B8] text-sm">
                    Already have an account?{' '}
                    <button
                        onClick={onToggleMode}
                        className="text-[#4F8CFF] hover:text-[#7B68EE] hover:underline transition-colors font-medium"
                    >
                        Sign in here
                    </button>
                </p>
            </div>
        </div>
    );
};
Register.propTypes = {
    onToggleMode: PropTypes.func.isRequired,
};

export default Register