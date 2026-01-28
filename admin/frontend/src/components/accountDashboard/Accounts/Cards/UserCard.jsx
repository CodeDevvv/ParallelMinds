import { MapPinIcon, CalendarDaysIcon, UserGroupIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { getInitials } from '../../../../helpers/helpers';

const UserCard = ({ user, setUser, setIsOpen }) => {
    const handleViewProfile = () => {
        setIsOpen();
        setUser(user);
    };


    return (
        <div
            onClick={handleViewProfile}
            className="group flex h-full cursor-pointer flex-col rounded-xl border border-neutral-800 bg-neutral-900 
                       shadow-lg transition-all duration-300 hover:border-sky-500/50 hover:-translate-y-1.5"
        >
            <div className="flex items-start justify-between p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sky-800 text-sky-300 font-bold text-lg">
                        {getInitials(user?.full_name)}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{user?.full_name}</h3>
                        <p className="flex items-center gap-1.5 text-sm text-neutral-400">
                            <EnvelopeIcon className="h-4 w-4" />
                            {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-grow space-y-3 border-t border-neutral-800 px-5 py-4">
                <p className="flex items-center gap-2 text-sm text-neutral-400">
                    <MapPinIcon className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                    <span>{user?.city || 'Unknown Location'}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-neutral-400">
                    <UserGroupIcon className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                    <span>Group ID: {user.group_id || 'Not Assigned'}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-neutral-400">
                    <CalendarDaysIcon className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                    <span>Joined on {new Date(user.created_at).toLocaleDateString('en-GB')}</span>
                </p>
            </div>

            <div className="mt-auto border-t border-neutral-800 p-4">
                <div className="flex items-center justify-end text-sm font-semibold text-sky-500">
                    <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        View Profile
                    </span>
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </div>
    );
};

UserCard.propTypes = {
    user: PropTypes.object.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};

export default UserCard;