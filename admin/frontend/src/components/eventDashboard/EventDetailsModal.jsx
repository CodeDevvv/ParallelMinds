import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
    X, Calendar, Clock, Users, MapPin, Tag, Target, HeartPulse, User, Stethoscope, Copy,
    MessageSquare,
    Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import config from '../../config';
import Loader from '../../ui/Loader';
import FullScreenLoader from '../../ui/FullScreenLoader';

// 1. Add this helper function at the top of your component (or outside it)
const formatSeverity = (data) => {
    // Case A: It's null or undefined
    if (!data) return 'Any';

    // Case B: It's a String (The cause of your crash)
    // We wrap it in an array so we can process it uniformly
    const arrayData = Array.isArray(data) ? data : [data];

    if (arrayData.length === 0) return 'Any';

    // Case C: It's an Array -> Format it nicely
    return arrayData
        .map(s => {
            if (typeof s !== 'string') return ''; // Safety check
            return s.replace(/_/g, ' ') // "moderately_severe" -> "moderately severe"
                .replace(/\b\w/g, c => c.toUpperCase()); // -> "Moderately Severe"
        })
        .join(', ');
};

const EventDetailsModal = ({ isOpen, onClose, event }) => {
    const [activeTab, setActiveTab] = useState('audience');
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFeedbacks([]);

        const fetchEventFeedback = async () => {
            if (!event?.id) return;

            setIsLoading(true);
            try {
                const res = await axios.get(`${config.API_URL}/fetchEventFeedback?eventId=${event.id}`);
                if (res.data.feedbacks && res.data.feedbacks.length > 0) {
                    setFeedbacks(res.data.feedbacks);
                }
            } catch (error) {
                console.log(error.message);
                toast.error("Server request failed. Please retry.");
            } finally {
                setIsLoading(false);
            }
        };

        if (activeTab === 'feedback' && isOpen) {
            fetchEventFeedback();
        }
    }, [activeTab, event, isOpen]);

    if (!isOpen || !event) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'Date N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString('en-IN', { dateStyle: 'medium' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'Time N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-neutral-800 text-white shadow-xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <header className="flex-shrink-0 p-6 border-b border-neutral-700">
                    <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-neutral-700">
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold pr-8">{event.title}</h2>
                    <span className="rounded-full bg-sky-900/70 px-3 py-1 text-xs font-semibold text-sky-300 mt-2 inline-block capitalize">
                        {event.event_type?.replace('_', ' ') || 'Event'}
                    </span>
                </header>

                {isLoading && activeTab === 'feedback' && feedbacks.length === 0 ? (
                    <div className="p-10">
                        <FullScreenLoader message={"Fetching details..."} />
                    </div>
                ) : (
                    <main className="flex-1 overflow-y-auto p-6">
                        <section className="mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <DetailItem icon={Calendar} label="Date" value={formatDate(event.start_date_time)} />
                                <DetailItem icon={Clock} label="Time" value={formatTime(event.start_date_time)} />
                                <DetailItem icon={MapPin} label="Location" value={event.address || 'Online'} />
                                <DetailItem icon={Users} label="Capacity" value={`${event.attendees?.users?.length || 0} / ${event.capacity}`} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-4 mt-6 border-t border-neutral-700/60 pt-6">
                                <div>
                                    <h3 className="font-semibold text-neutral-200 mb-2">Event ID</h3>
                                    <p className="text-neutral-400 text-xs font-mono bg-neutral-900/50 p-2 rounded w-fit">
                                        {event.id}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-neutral-200 mb-2">Description</h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed">
                                        {event.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <nav className="flex border-b border-neutral-700 overflow-x-auto">
                                <button onClick={() => handleTabChange('audience')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'audience' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-neutral-400 hover:text-white'}`}>
                                    Target Audience
                                </button>
                                <button onClick={() => handleTabChange('attendees')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'attendees' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-neutral-400 hover:text-white'}`}>
                                    Attendees
                                </button>
                                <button onClick={() => handleTabChange('feedback')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'feedback' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-neutral-400 hover:text-white'}`}>
                                    Feedback
                                </button>
                            </nav>

                            <div className="py-6">
                                {activeTab === 'audience' && (
                                    <div className="rounded-lg bg-neutral-700/30 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">

                                        <DetailItem
                                            icon={Tag}
                                            label="Interests"
                                            value={<TagList items={Array.isArray(event.target_interests) ? event.target_interests : []} />}
                                        />

                                        <DetailItem
                                            icon={HeartPulse}
                                            label="PHQ-9 / GAD-7 Severity"
                                            value={`${formatSeverity(event.target_phq_severity)} / ${formatSeverity(event.target_gad_severity)}`}
                                        />

                                        <DetailItem
                                            icon={Target}
                                            label="Life Transitions"
                                            value={<TagList items={Array.isArray(event.target_life_transitions) ? event.target_life_transitions : []} />}
                                        />

                                    </div>
                                )}
                                {activeTab === 'attendees' && (
                                    <div className="rounded-lg bg-neutral-700/30 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AttendeeList title="Registered Users" attendees={event.attendees?.users || []} icon={User} />
                                        <AttendeeList title="Attending Doctors" attendees={event.attendees?.doctors || []} icon={Stethoscope} />
                                    </div>
                                )}
                                {activeTab === 'feedback' && (
                                    <div className="rounded-lg bg-neutral-700/30 p-4">
                                        {isLoading ? <Loader /> :
                                            !feedbacks || feedbacks.length === 0 ? (
                                                <div className="text-center py-16">
                                                    <MessageSquare size={48} className="mx-auto text-neutral-600" />
                                                    <h3 className="mt-4 text-lg font-semibold text-neutral-200">No Feedback Yet</h3>
                                                    <p className="mt-1 text-sm text-neutral-400">User feedback for this event will appear here.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {feedbacks.map((item) => (
                                                        <div key={item.id || item._id} className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <p className="text-sm text-neutral-400">
                                                                        Submitted by <span className="font-medium text-sky-400">{item.user_name || item.user || 'Anonymous'}</span>
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-neutral-500 flex-shrink-0 ml-4">
                                                                    {formatDate(item.created_at || item.createdAt)}
                                                                </p>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-1">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <Star
                                                                            key={star}
                                                                            size={16}
                                                                            className={item.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-neutral-600'}
                                                                        />
                                                                    ))}
                                                                </div>

                                                                {item.comment ? (
                                                                    <p className="text-sm text-neutral-300 bg-neutral-900/50 rounded-md p-3">
                                                                        "{item.comment}"
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-sm text-neutral-500 italic">No comment provided.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        }
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>
                )}
            </div>
        </div>
    );
};

EventDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    event: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        start_date_time: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        capacity: PropTypes.number,
        event_type: PropTypes.string,
        target_interests: PropTypes.arrayOf(PropTypes.string),
        target_life_transitions: PropTypes.arrayOf(PropTypes.string),
        target_phq_severity: PropTypes.arrayOf(PropTypes.string),
        target_gad_severity: PropTypes.arrayOf(PropTypes.string),
        address: PropTypes.string,
        attendees: PropTypes.shape({
            users: PropTypes.arrayOf(PropTypes.string),
            doctors: PropTypes.arrayOf(PropTypes.string),
        }),
    }),
};

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-sky-400 mt-1" />}
        <div>
            <p className="font-semibold text-neutral-300">{label}</p>
            <div className="text-neutral-100">{value}</div>
        </div>
    </div>
);

const TagList = ({ items }) => (
    <div className="flex flex-wrap gap-2">
        {items && items.length > 0 ? (
            items.map(item => (
                <span key={item} className="rounded-full bg-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300">
                    {item}
                </span>
            ))
        ) : (
            <span className="text-xs text-neutral-500">Not specified</span>
        )}
    </div>
);

const AttendeeList = ({ title, attendees, icon: Icon }) => {
    const handleCopy = (id) => {
        navigator.clipboard.writeText(id);
        toast.success(`Copied ID: ${id.substring(0, 8)}...`);
    };

    return (
        <div>
            <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-neutral-200">
                {Icon && <Icon size={18} />} {title} ({attendees.length})
            </h4>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg bg-neutral-900/50 p-3">
                {attendees.length > 0 ? (
                    attendees.map(attendeeId => (
                        <div key={attendeeId} className="group flex items-center justify-between gap-3 p-1 rounded hover:bg-neutral-700/50">
                            <span className="font-mono text-sm text-neutral-400 truncate w-32">{attendeeId}</span>
                            <button onClick={() => handleCopy(attendeeId)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy size={14} className="text-neutral-500 hover:text-sky-400" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="py-4 text-center text-sm text-neutral-500">
                        No registered attendees.
                    </p>
                )}
            </div>
        </div>
    );
};

AttendeeList.propTypes = {
    title: PropTypes.string.isRequired,
    attendees: PropTypes.arrayOf(PropTypes.string).isRequired,
    icon: PropTypes.elementType.isRequired,
};

export default EventDetailsModal;