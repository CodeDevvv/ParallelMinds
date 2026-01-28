import axios from 'axios';
import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, MessageSquare, ListFilter, CalendarRange } from 'lucide-react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import config from '../../../config';
import FeedbackForm from './FeedbackForm';
import { formatDate, formatTime } from '../../../utils/helperFunctions';
import FilterModal from './EventFilterModal';

const TabButton = ({ name, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === name ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
    >
        {name}
    </button>
);

TabButton.propTypes = {
    name: PropTypes.string.isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
};

const Events = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        tags: [],
        sort: 'newest',
        showMissedOnly: false
    });
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchEvents = async () => {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams({
                status: activeTab.toLowerCase(),
                sort: filters.sort,
            });
            if (filters.tags.length > 0) {
                params.append('tags', filters.tags.join(','));
            }
            if (activeTab === 'Completed' && filters.showMissedOnly) {
                params.append('showMissedOnly', 'true');
            }
            try {
                const response = await axios.get(`${config.API_URL}/api/user/fetchEvents?${params.toString()}`, {
                    withCredentials: true,
                    signal: controller.signal
                });

                if (response.data.status) {
                    setEvents(response.data.events);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch events.');
                }
            } catch (err) {
                if (axios.isCancel(err)) return;
                setError(err.response?.data?.message || err.message || 'An error occurred.');
                console.error(err);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        fetchEvents();

        return () => {
            controller.abort();
        };
    }, [activeTab, filters, feedbackSubmitted]);

    const handleJoin = async (eventId, title) => {
        try {
            const response = await axios.post(`${config.API_URL}/api/user/joinEvent`, { eventId }, { withCredentials: true });
            const { status, message } = response.data;
            if (status) {
                toast.success(`${title} - Event Joined`);
                setActiveTab("Joined");
            } else {
                throw new Error(message || 'Failed to Join Event.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'An error occurred.');
            console.error(err);
        }
    };

    const handleLeave = async (eventId, title) => {
        try {
            const response = await axios.delete(`${config.API_URL}/api/user/leaveEvent?eventId=${eventId}`, { withCredentials: true });
            const { status, message } = response.data;
            if (status) {
                toast.success(`${title} - Event Left`);
                setActiveTab("Upcoming");
            } else {
                throw new Error(message || 'Failed to Leave Event.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'An error occurred.');
            console.error(err);
        }
    };

    const handleSubmitFeedback = (eventId) => {
        setSelectedEventId(eventId);
        setIsFeedbackFormOpen(true);
    };

    return (
        <>
            <FilterModal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)} filters={filters} setFilters={setFilters} activeTab={activeTab} setHasActiveFilters={setHasActiveFilters} />
            <FeedbackForm isOpen={isFeedbackFormOpen} onClose={() => setIsFeedbackFormOpen(false)} eventId={selectedEventId} submitted={() => setFeedbackSubmitted(!feedbackSubmitted)} />
            <div className="flex-1 text-white p-6 md:p-8 ml-64 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-neutral-100">Events</h1>
                        <p className="text-neutral-400 mt-1">Join workshops, group sessions, and community gatherings.</p>
                    </header>

                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <div className="flex items-center bg-neutral-800 p-1 rounded-lg">
                            <TabButton name="Joined" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton name="Upcoming" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton name="Completed" activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                        {(events?.length > 0 || hasActiveFilters) && (
                            <button
                                onClick={() => setFilterModalOpen(true)}
                                className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-md transition-colors"
                            >
                                <ListFilter className="h-4 w-4" />
                                Filters
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="text-center py-10 text-neutral-400">Loading...</div>
                        ) : error ? (
                            <div className="text-center py-10 text-red-400">{error}</div>
                        ) : events.length > 0 ? (
                            events.map(event => (
                                <div key={event._id} className="bg-neutral-800 rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
                                    <div className="p-6 md:w-2/3 flex flex-col">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {event.tags.map(tag => (
                                                <span key={tag} className="text-xs font-semibold bg-neutral-700 text-neutral-300 px-2 py-1 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-100 mb-1">{event.title}</h3>
                                        <p className="text-neutral-400 text-sm mb-4 flex-grow">{event.summary}</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-300 border-t border-neutral-700 pt-4">
                                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-neutral-500" /> {formatDate(event.startDateTime)}</div>
                                            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-neutral-500" /> {formatTime(event.startDateTime)}</div>
                                            <div className="flex items-center gap-2 col-span-2"><MapPin className="h-4 w-4 text-neutral-500" /> {event.address}</div>
                                        </div>
                                        <div className="mt-6">
                                            {activeTab === "Joined" && (
                                                <button onClick={() => handleLeave(event._id, event.title)} className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                                                    <XCircle className="h-5 w-5" /> Leave
                                                </button>
                                            )}
                                            {activeTab === 'Upcoming' && (
                                                <button onClick={() => handleJoin(event._id, event.title)} className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                                                    <CheckCircle className="h-5 w-5" /> Join Now
                                                </button>
                                            )}

                                            {activeTab === 'Completed' && event.attended && (
                                                event.feedback ?
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-green-900/50 px-4 py-2 text-sm font-medium text-green-300">
                                                        <CheckCircle className="h-5 w-5" />
                                                        <span> Feedback Submitted</span>
                                                    </div>
                                                    :
                                                    <button
                                                        onClick={() => handleSubmitFeedback(event._id)}
                                                        className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                                                    >
                                                        <MessageSquare className="h-5 w-5" /> Submit Feedback
                                                    </button>
                                            )}
                                            {activeTab === 'Completed' && !event.attended && (
                                                <div className="inline-flex items-center gap-2 rounded-full bg-red-900/50 px-4 py-2 text-sm font-medium text-red-300">
                                                    <XCircle className="h-5 w-5" />
                                                    <span>Event Missed</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:w-1/3 bg-neutral-700 flex items-center justify-center p-4">
                                        <CalendarRange className="h-16 w-16 text-neutral-500" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-neutral-800 rounded-lg">
                                {
                                    hasActiveFilters ?
                                        <p className="text-neutral-400">No events match the current filters.</p>
                                        :
                                        activeTab === "Upcoming" ?
                                            <p className="text-neutral-400">There are no upcoming events at the moment. Stay tuned!</p>
                                            :
                                            activeTab === "Completed" ?
                                                <p className="text-neutral-400">No Events Found</p>
                                                :
                                                <p className="text-neutral-400">You&apos;re all caught up!</p>
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Events;