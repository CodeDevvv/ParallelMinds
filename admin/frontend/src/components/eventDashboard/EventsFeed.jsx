import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import toast from 'react-hot-toast';

import { motion as Motion } from 'framer-motion';
import EventDetailsModal from './EventDetailsModal';
import EventCard from './Cards/EventCard';
import PaginationNav from '../../ui/PaginationNav';

const EventsFeed = ({ refresh }) => {
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false)
    const [event, setEvent] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${config.API_URL}/events/fetchEvents?status=${activeTab}&page=${currentPage}`)
                const { status, message, events, hasMore } = response.data
                if (status) {
                    setEvents(events);
                    setHasMore(hasMore)
                } else {
                    toast.error(message)
                }
            } catch (error) {
                console.log(error.message)
                toast.error("Server request failed. Please retry.")
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [activeTab, currentPage, refresh]);

    const handlViewDetails = (event) => {
        setIsOpen(true)
        setEvent(event)
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setCurrentPage(1)
    }

    return (
        <section>
            <div className="max-w-7xl ml-6">
                <div className="flex items-center gap-6 border-b border-neutral-800">
                    <button onClick={() => handleTabChange('upcoming')} className="relative py-3 px-1 text-sm font-medium transition-colors text-neutral-400 hover:text-white">
                        Upcoming Events
                        {activeTab === 'upcoming' && (
                            <Motion.span
                                layoutId="tab-underline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                    </button>
                    <button onClick={() => handleTabChange('past')} className="relative py-3 px-1 text-sm font-medium transition-colors text-neutral-400 hover:text-white">
                        Past Events
                        {activeTab === 'past' && (
                            <Motion.span
                                layoutId="tab-underline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                    </button>
                </div>

                <div className="mt-8">
                    {isLoading ? (
                        <div className="text-center py-16 text-neutral-500">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-16 bg-neutral-900 border border-dashed border-neutral-800 rounded-lg">
                            <h1 className="text-xl font-semibold text-white">No Events Found</h1>
                            <p className="text-neutral-400 mt-2">There are no {activeTab === 'upcoming' ? 'upcoming' : 'past'} events to show right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {events.map((event) =>
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    handlViewDetails={handlViewDetails}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <PaginationNav
                onNext={() => setCurrentPage(p => p + 1)}
                onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
                hideNext={!hasMore}
                hidePrev={currentPage === 1}
            />

            {isOpen && <EventDetailsModal isOpen={isOpen} onClose={() => setIsOpen(false)} event={event} />}
        </section>
    );
};

export default EventsFeed;