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

const EventDetailsModal = ({ isOpen, onClose, event }) => {
    const [activeTab, setActiveTab] = useState('audience');
    const [feedbacks, setFeedbacks] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchEventFeedback = async () => {
            setIsLoading(true)
            try {
                const res = await axios.get(`${config.API_URL}/fetchEventFeedback?eventId=${event._id}`)
                if (res.data.feedbacks.length !== 0) {
                    setFeedbacks(res.data.feedbacks)
                }
            } catch (error) {
                console.log(error.message)
                toast.error("Server request failed. Please retry.")
            } finally {
                setIsLoading(false)
            }
        }
        if (activeTab === 'feedback') {
            fetchEventFeedback()
        }
    }, [activeTab, event])

    if (!isOpen || !event) return null;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-IN', {
        hour: 'numeric', minute: '2-digit', hour12: true
    });

    const handleTabChange = (tab) => {
        setActiveTab(tab)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-neutral-800 text-white shadow-xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <header className="flex-shrink-0 p-6 border-b border-neutral-700">
                    <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-neutral-700">
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold pr-8">{event.title}</h2>
                    <span className="rounded-full bg-sky-900/70 px-3 py-1 text-xs font-semibold text-sky-300 mt-2 inline-block">
                        {event.eventType}
                    </span>
                </header>

                {
                    isLoading ? <FullScreenLoader message={"Fecthing Event Details...."} />
                        :
                        (<main className="flex-1 overflow-y-auto p-6">
                            <section className="mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <DetailItem icon={Calendar} label="Date" value={formatDate(event.startDateTime)} />
                                    <DetailItem icon={Clock} label="Time" value={formatTime(event.startDateTime)} />
                                    <DetailItem icon={MapPin} label="Location" value={event.address} />
                                    <DetailItem icon={Users} label="Capacity" value={`${event.attendees.users.length} / ${event.capacity}`} />
                                </div>
                                <div className="grid grid-cols-2 pl-4 mt-6 border-t border-neutral-700/60 pt-6">
                                    <div>
                                        <h3 className="font-semibold text-neutral-200 mb-2">Event Id</h3>
                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                            {event._id || 'No description provided.'}
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
                                <nav className="flex border-b border-neutral-700">
                                    <button onClick={() => handleTabChange('audience')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'audience' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-neutral-400 hover:text-white'}`}>
                                        Target Audience
                                    </button>
                                    <button onClick={() => handleTabChange('attendees')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'attendees' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-neutral-400 hover:text-white'}`}>
                                        Attendees
                                    </button>
                                    <button onClick={() => handleTabChange('feedback')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'feedback' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-neutral-400 hover:text-white'}`}>
                                        Feedbacks
                                    </button>
                                </nav>

                                <div className="py-6">
                                    {activeTab === 'audience' && (
                                        <div className="rounded-lg bg-neutral-700/30 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <DetailItem icon={Tag} label="Interests" value={<TagList items={event.targetInterests} />} />
                                            <DetailItem icon={HeartPulse} label="PHQ-9 / GAD-7 Severity" value={`${event.targetPHQ9Severity} / ${event.targetGAD7Severity}`} />
                                        </div>
                                    )}
                                    {activeTab === 'attendees' && (
                                        <div className="rounded-lg bg-neutral-700/30 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <AttendeeList title="Registered Users" attendees={event.attendees.users} icon={User} />
                                            <AttendeeList title="Attending Doctors" attendees={event.attendees.doctors} icon={Stethoscope} />
                                        </div>
                                    )}
                                    {activeTab === 'feedback' && (
                                        <div className="rounded-lg bg-neutral-700/30 p-4">
                                            {
                                                isLoading ? <Loader /> :
                                                    !feedbacks || feedbacks.length === 0 ? (
                                                        <div className="text-center py-16">
                                                            <MessageSquare size={48} className="mx-auto text-neutral-600" />
                                                            <h3 className="mt-4 text-lg font-semibold text-neutral-200">No Feedback Yet</h3>
                                                            <p className="mt-1 text-sm text-neutral-400">User feedback for this event will appear here.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-6">
                                                            {feedbacks.map((item) => (
                                                                <div key={item._id} className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <div>
                                                                            <p className="text-sm text-neutral-400">
                                                                                Submitted by <span className="font-medium text-sky-400">{item.user || 'A user'}</span>
                                                                            </p>
                                                                        </div>
                                                                        <p className="text-xs text-neutral-500 flex-shrink-0 ml-4">
                                                                            {formatDate(item.createdAt)}
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
                        </main>)

                }
            </div>
        </div>
    );
};

EventDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    event: PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        startDateTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        capacity: PropTypes.number,
        eventType: PropTypes.string,
        targetInterests: PropTypes.arrayOf(PropTypes.string),
        targetLifeTransitions: PropTypes.arrayOf(PropTypes.string),
        targetPHQ9Severity: PropTypes.string,
        targetGAD7Severity: PropTypes.string,
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
                            <span className="font-mono text-sm text-neutral-400">{attendeeId}</span>
                            <button onClick={() => handleCopy(attendeeId)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy size={14} className="text-neutral-500 hover:text-sky-400" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="py-4 text-center text-sm text-neutral-500">
                        No {title.toLowerCase()} have registered yet.
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