import axios from 'axios';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

const Authentication = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { setAuth, setAdminData } = useAuthStore()
    const [isloading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const res = await axios.post(`${config.API_URL}/auth`, form)
            const { status, message, adminData, token } = res.data
            if (status) {
                toast.success(message)
                setAuth(token)
                setAdminData(adminData)
                navigate('/')
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            console.log(error.message)
            toast.error("Server request failed. Please retry.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-surface-100 to-surface-200 text-text-primary">
            <div className="bg-surface-100 border border-border rounded-2xl shadow-2xl p-10 w-full max-w-md">
                <h1 className="text-4xl font-extrabold mb-2 text-center tracking-tight">Admin Login</h1>
                <p className="text-text-muted mb-8 text-center text-sm">Sign in to your admin dashboard</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-surface-200 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                            placeholder="admin@example.com"
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1 font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-surface-200 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-500 text-xs font-semibold"
                                tabIndex={-1}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-semibold text-lg shadow-md transition"
                        disabled={isloading}
                    >
                        {isloading ? 'Logging In....' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Authentication;
