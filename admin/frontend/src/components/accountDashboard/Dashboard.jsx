import React, { useState } from 'react';
import {  UsersIcon, UserPlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion as Motion } from 'framer-motion';
import DoctorAccountManager from './Accounts/DoctorAccountManager';
import AdminAccountManager from './Accounts/AdminAccountManager';
import UserAccountManager from './Accounts/UserAccountManager';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('Users');
    const tabs = [
        { name: 'Users', icon: UsersIcon },
        { name: 'Doctors', icon: UserPlusIcon },
        { name: 'Admins', icon: ShieldCheckIcon }
    ];

    return (
        <div className="bg-neutral-950 min-h-screen text-white p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Account Management</h1>
                    <p className="text-neutral-400 mt-1">
                        Manage users, doctors, and admin accounts.
                    </p>
                </div>
            </header>

            <nav className="flex items-center gap-6 border-b border-neutral-800 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`relative flex items-center gap-2 py-3 px-1 text-sm font-medium transition-colors ${activeTab === tab.name ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                        {activeTab === tab.name && (
                            <Motion.span
                                layoutId="tab-underline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            <main>
                {activeTab === 'Users' && <UserAccountManager />}
                {activeTab === 'Doctors' && <DoctorAccountManager />}
                {activeTab === 'Admins' && <AdminAccountManager />}
            </main>
        </div>
    );
};

export default Dashboard;