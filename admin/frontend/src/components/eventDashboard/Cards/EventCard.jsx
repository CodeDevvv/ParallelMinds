import {
    MagnifyingGlassIcon,
    ClockIcon,
    MapPinIcon,
    UserGroupIcon,
    SparklesIcon,
    PaintBrushIcon,
    PuzzlePieceIcon,
    HeartIcon,
    TicketIcon, 
} from '@heroicons/react/24/outline';
import { formatTime, getDay, getMonth } from '../../../helpers/helpers';

const EventCard = ({event , handlViewDetails}) => {
    const eventTypeDetails = {
        'Wellness': { icon: HeartIcon, color: 'sky' },
        'Volunteering': { icon: UserGroupIcon, color: 'emerald' },
        'Creative': { icon: PaintBrushIcon, color: 'amber' },
        'Therapeutic': { icon: PuzzlePieceIcon, color: 'violet' },
        'Social': { icon: SparklesIcon, color: 'rose' },
        'Default': { icon: TicketIcon, color: 'gray' }
    };

    const details = eventTypeDetails[event.eventType] || eventTypeDetails['Default'];
    const EventIcon = details.icon;

    const eventDate = new Date(event.startDateTime);
    const month = getMonth(eventDate).toUpperCase();
    const day = getDay(eventDate);

    return (
        <div key={event._id} className="bg-neutral-900 w-100 rounded-xl border border-neutral-800 shadow-lg hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-row overflow-hidden">
            <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center bg-neutral-800/50 border-r-2 border-dashed border-neutral-700 p-2">
                <p className="text-sm font-bold text-rose-400 tracking-wider">{month}</p>
                <p className="text-4xl font-extrabold text-white my-1">{String(day).padStart(2, '0')}</p>
                <p className="text-xs text-neutral-400">{eventDate.getFullYear()}</p>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 bg-${details.color}-500/10 text-${details.color}-400 rounded`}>
                        {event.eventType}
                    </span>
                    <EventIcon className="w-6 h-6 text-neutral-500" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>

                <div className="space-y-2 text-sm text-neutral-400 mb-4">
                    <p className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-neutral-500" />
                        <span>{formatTime(event.startDateTime)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <MapPinIcon className="w-8 h-8 text-neutral-500" />
                        <span>{event.address}</span>
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-neutral-800 flex justify-between items-center">
                    <div className="text-sm items-center">
                        <span className="font-bold text-white">{event.capacity}</span>
                        <span className="text-neutral-500"> Spots Available</span>
                    </div>
                    <button className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition-colors" onClick={() => handlViewDetails(event)}>
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard