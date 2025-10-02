import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../../config';
import RecentActivity from './RecentActivity';
import NavigationCard from './NavigationCard';
import StatCard from './StatCard';
import Logo from "../../assets/Logo1.png";
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import FullScreenLoader from '../../ui/FullScreenLoader';

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [stats, setStats] = useState({ users: 0, doctors: 0, ongoingEvents: 0, completedEvents: 0 })

    useEffect(() => {
        const fetchCounts = async () => {
            setIsLoading(true)
            try {
                const res = await axios.get(`${config.API_URL}/fetchCounts`)
                const { status, message, stats } = res.data
                if (status) {
                    const counts = stats
                    setStats({ ...stats, users: counts.users, doctors: counts.doctors, ongoingEvents: counts.ongoing, completedEvents: counts.completed })
                } else {
                    toast.error(message)
                }
            } catch (error) {
                console.log(error.message)
                toast.error("Server request failed. Please retry.")

            } finally {
                setIsLoading(false)  
            }
        }
        fetchCounts()
    }, [])

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (isLoading) {
        return <FullScreenLoader message={"Preparing your dashboard..."} />
    }

    return (
        <div className="bg-neutral-950 min-h-screen text-white p-4 sm:p-6 lg:p-8">

            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <img src={Logo} alt="Logo" className="h-24 w-24 rounded-lg" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-neutral-400 mt-1">
                            Welcome back, here's your overview for today.
                        </p>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-neutral-500">
                    <CalendarDaysIcon className="h-5 w-5" />
                    <span>{currentDate}</span>
                </div>
            </header>

            <div className="space-y-8">
                <StatCard stats={stats} />
                <NavigationCard />
                <RecentActivity />
            </div>
        </div>
    );
};
export default Dashboard;
