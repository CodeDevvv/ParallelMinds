import { Users, Info, Tag, CalendarCheck, MessageCircleMoreIcon } from 'lucide-react';
import PropTypes from 'prop-types';

const GroupCard = ({ group, onViewDetails, onViewChat }) => {
  return (
    <div 
      className="relative flex h-full flex-col rounded-xl border border-neutral-800 bg-neutral-900 
                 shadow-lg transition-all duration-300 hover:border-sky-500/50 hover:-translate-y-1"
    >
      <div className="absolute top-4 right-4 bg-neutral-800 text-sky-400 text-xs font-mono px-2 py-1 rounded-full">
        {group._id.slice(-6)} 
      </div>

      <div className="flex-1 space-y-5 p-5">
        <div className="flex items-center divide-x divide-neutral-700/50 bg-neutral-800/50 rounded-lg p-3">
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2">
            <Users size={20} className="text-sky-400" />
            <p className="text-sm text-neutral-400">
              <span className="font-bold text-white">{group.membersId.length || 0}</span> Members
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2">
            <CalendarCheck size={20} className="text-emerald-400" />
            <p className="text-sm text-neutral-400">
              <span className="font-bold text-white">{group.matchedEvents.length || 0}</span> Events
            </p>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-300">
            Shared Interests
          </h4>
          <div className="flex flex-wrap gap-2">
            {group.groupProfile.sharedInterests.length > 0 ? (
              group.groupProfile.sharedInterests.slice(0, 5).map(interest => ( 
                <span key={interest} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                  <Tag size={12} />
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-xs text-neutral-500">No shared interests specified.</p>
            )}
            {group.groupProfile.sharedInterests.length > 5 && (
              <span className="text-xs font-medium text-neutral-500">
                + {group.groupProfile.sharedInterests.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800 p-4 flex justify-between items-center">
        <p className="text-xs text-neutral-500">
          Created: {new Date(group.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-2 h-10">
          <button 
            onClick={() => onViewDetails(group)} 
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 
                       rounded-md hover:bg-neutral-800 transition-colors"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={() => onViewChat(group._id)} 
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white 
                       bg-sky-600 rounded-md hover:bg-sky-700 transition-colors"
          >
            <MessageCircleMoreIcon size={14} />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
};

GroupCard.propTypes = {
  group: PropTypes.object.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onViewChat: PropTypes.func.isRequired,
};

export default GroupCard;