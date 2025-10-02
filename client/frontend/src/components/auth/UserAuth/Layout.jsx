import { useState } from 'react';

import { useLoading } from '../../../store.js';

import Login from './Login.jsx';
import Register from './Register.jsx';
import Loader from '../../../ui/Loader.jsx';
import DoctorAuthLayout from '../DoctorAuth/Layout.jsx';

const Layout = () => {
    const { isLoading } = useLoading();
    const [login, setLogin] = useState(true);
    const [isUser, setIsUser] = useState(true);

    if (isLoading) {
        return <Loader message="Processing..." />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F0F] via-[#121212] to-[#1A1A1A] p-6">
            <div className="w-full max-w-xl mx-auto bg-[#1E1E1E] border border-[#404040] rounded-2xl shadow-2xl p-10">
                <div className="flex justify-center mb-8 space-x-6">
                    <button
                        onClick={() => setIsUser(true)}
                        className={`pb-2 font-semibold transition-colors duration-200 ${isUser
                                ? 'text-[#4F8CFF] border-b-2 border-[#4F8CFF]'
                                : 'text-[#B8B8B8] hover:text-[#4F8CFF]'
                            }`}
                    >
                        User
                    </button>
                    <span className="text-[#666]">|</span>
                    <button
                        onClick={() => setIsUser(false)}
                        className={`pb-2 font-semibold transition-colors duration-200 ${!isUser
                                ? 'text-[#4F8CFF] border-b-2 border-[#4F8CFF]'
                                : 'text-[#B8B8B8] hover:text-[#4F8CFF]'
                            }`}
                    >
                        Doctor
                    </button>
                </div>

                {isUser ? (
                    login ? (
                        <Login onToggleMode={() => setLogin(false)} />
                    ) : (
                        <Register onToggleMode={() => setLogin(true)} />
                    )
                ) : (
                    <DoctorAuthLayout />
                )}
            </div>
        </div>
    );
};

export default Layout;
