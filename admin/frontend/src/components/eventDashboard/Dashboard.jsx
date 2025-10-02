import HostEvent from './HostEvent';
import EventsFeed from './EventsFeed';
import { PlusIcon, XCircleIcon } from '@heroicons/react/24/outline'; 
import { useState } from 'react';

const Dashboard = () => {
    const [createEventIsOpen, setCreateEventIsOpen] = useState(false)
    const [eventHosted, setEventHosted] = useState(false)

    return (
        <div className="bg-neutral-950 min-h-screen text-white p-4 sm:p-6 lg:p-8">

            <header className="flex justify-between pb-6 border-b border-neutral-800 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Events Management
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        Create, publish, and manage all your events from one place.
                    </p>
                </div>

                <button
                    className={`flex items-center gap-2 font-semibold px-4 py-1 rounded-lg shadow-md transition-colors duration-200 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950
              ${createEventIsOpen
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'}`}
                    onClick={() => setCreateEventIsOpen(!createEventIsOpen)}
                >
                    {createEventIsOpen ? (
                        <>
                            <XCircleIcon className="h-5 w-5" />
                            <span>Close</span>
                        </>
                    ) : (
                        <>
                            <PlusIcon className="h-5 w-5" />
                            <span>Create Event</span>
                        </>
                    )}
                </button>
            </header>

            {createEventIsOpen && <HostEvent onClose={() => setCreateEventIsOpen(false)} onSuccess={() => setEventHosted(!eventHosted)} />}
            <EventsFeed refresh={eventHosted} />

        </div>
    );
};

export default Dashboard;