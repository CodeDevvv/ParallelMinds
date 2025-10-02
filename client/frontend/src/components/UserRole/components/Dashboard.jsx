import { useEffect, useState } from 'react';
import { ArrowRight, User, Sparkles, CalendarX } from 'lucide-react';
import { useDailyTip, useUser } from '../utils/dataQuery';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import config from '../../../config';
import { formatDate, formatTime } from '../../../utils/helperFunctions'
import { CalendarIcon, QuestionMarkCircleIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

const dashboardLinks = [
  { to: "/user/events", icon: CalendarIcon, label: "View Events" },
  { to: "/user/community", icon: Squares2X2Icon, label: "Community" },
  { to: "/user/support", icon: QuestionMarkCircleIcon, label: "Support" },
  { to: "/user/profile", icon: User, label: "Update Profile" },
];

const UserDashboard = () => {
  const { data: userData } = useUser()
  const [events, setEvents] = useState([])
  const { data: dailyTip } = useDailyTip();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/user/fetchEvents?status=upcoming&forDashboard=true`, {
          withCredentials: true
        })
        setEvents(response.data.events)
      } catch (error) {
        console.log(error.message)
        toast.error("Server request failed. Please retry.")
      }
    }
    fetchEvents()
  }, [])

  return (
    <div className="flex-1 text-white p-6 md:p-8 ml-64 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100">
            Welcome, {userData?.personalInfo?.name.split(' ')[0]}!
          </h1>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="group bg-neutral-900 p-6 rounded-xl border border-neutral-800 
                 hover:border-green-500/50 shadow-lg hover:shadow-green-500/10 
                 transition-all duration-300 ease-in-out transform hover:-translate-y-1 
                 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Icon className="h-8 w-8 text-green-500 transition-colors duration-300" />
                <h3 className="font-bold text-lg text-neutral-200">{label}</h3>
              </div>

              <ArrowRight
                className="h-6 w-6 text-neutral-400 opacity-0 group-hover:opacity-100 
                   transform -translate-x-4 group-hover:translate-x-0 
                   transition-all duration-300"
              />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-neutral-800 p-6 rounded-lg shadow-md">
            <div className='w-full flex justify-between'>
              <h2 className="text-xl font-bold text-neutral-100 mb-4">Upcoming Events</h2>
              {events.length > 0 && <a href="/user/events" className='text-green-600 hover:text-white'>More&gt;&gt;</a>}
            </div>
            {events.length === 0 ?
              (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-700 p-12 text-center">
                  <CalendarX className="h-12 w-12 text-neutral-500" />
                  <h2 className="mt-4 text-xl font-semibold text-neutral-200">
                    No Upcoming Events
                  </h2>
                  <p className="mt-2 text-sm text-neutral-400">
                    It looks like your schedule is clear. Check back later!
                  </p>
                </div>
              ) :
              (<div>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event._id} className="border border-neutral-700 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-neutral-200">{event.title}</h4>
                        <p className="text-sm text-neutral-400 mt-1">
                          {formatDate(event.startDateTime)} at {formatTime(event.startDateTime)}
                        </p>
                        <p className="text-sm text-neutral-400">{event.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>)
            }
          </div>
          <div className="bg-neutral-800 border-l-4 border-amber-500 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 text-amber-400 mr-3" />
              <h2 className="text-xl font-bold text-neutral-100">Random Spark</h2>
            </div>
            <p className="text-neutral-300 mt-3">
              {dailyTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
