import { Users, Calendar, X, Sparkles, CalendarCheck, MoreVertical, Flag, AlertTriangle, ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition, Disclosure } from '@headlessui/react';
import { Fragment } from 'react';

const GroupInfo = ({ isOpen, onClose, groupInfo }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    const { memberCount, joinedDate, eventsMatched, sharedInterests, members } = groupInfo;

    const handleNavigate = () => {
        onClose();
        navigate('/user/events');
    };

    const handleReport = () => {
        navigate('/user/support')
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative flex w-full max-w-2xl flex-col transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all dark:bg-neutral-900 max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Title and Action Menu */}
                <div className="p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/50 flex-shrink-0">
                                <Users className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold leading-6 text-gray-900 dark:text-neutral-100">
                                    Group Information
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-neutral-400">Details about your matched group.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Report Group Menu (Dropdown) */}
                            <Menu as="div" className="relative inline-block text-left">
                                <Menu.Button className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100">
                                    <MoreVertical size={20} />
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-neutral-200 dark:border-neutral-700">
                                        <div className="py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleReport}
                                                        className={`${active ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-neutral-300'} group flex w-full items-center px-4 py-2 text-sm`}
                                                    >
                                                        <Flag className="mr-3 h-5 w-5" />
                                                        Report Group
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Disclaimer Message */}
                    <div className="mb-6 flex items-start gap-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/50 p-4 border border-yellow-200 dark:border-yellow-800/80">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400/80">
                                All messages will be automatically deleted after 24 hours.
                            </p>
                        </div>
                    </div>

                    {/* Collapsible Section for Details */}
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-100 dark:bg-neutral-800 px-4 py-3 text-left text-sm font-medium text-sky-900 dark:text-sky-300 hover:bg-gray-200 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-sky-500 focus-visible:ring-opacity-75">
                                    <span>View Group Details & Members</span>
                                    <ChevronDown
                                        className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-sky-500 transition-transform`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500 dark:text-neutral-400">
                                    <div className="mb-6 space-y-3">
                                        {/* Static Info */}
                                        <InfoItem icon={Users} label="Total Members" value={memberCount} />
                                        <InfoItem icon={Calendar} label="Joined" value={new Date(joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                                        <InfoItem icon={CalendarCheck} label="Events Matched" value={eventsMatched} />
                                    </div>
                                    {/* Shared Interests */}
                                    <div className="mb-6">
                                        <h4 className="mb-3 flex items-center gap-2 text-md font-semibold text-gray-800 dark:text-neutral-100">
                                            <Sparkles size={18} /> Shared Interests
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {sharedInterests.map((interest) => (
                                                <span key={interest} className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800 dark:bg-sky-900/70 dark:text-sky-300">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Members List */}
                                    <div>
                                        <h4 className="mb-3 text-md font-semibold text-gray-800 dark:text-neutral-100">Members ({members.length})</h4>
                                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                                            {members.map((member) => (
                                                <div key={member.id} className="flex items-center gap-3">
                                                    <p className="font-medium text-gray-800 dark:text-neutral-200">{member.name}</p>

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>

                {/* Footer Button */}
                <div className="p-6 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                        onClick={handleNavigate}
                        className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                    >
                        View Matched Events
                    </button>
                </div>
            </div>
        </div>
    );
};


const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-neutral-800/50">
        <div className="flex items-center gap-3">
            <Icon className="text-gray-500 dark:text-neutral-400" size={20} />
            <span className="font-medium text-gray-700 dark:text-neutral-200">{label}</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-neutral-100">{value}</span>
    </div>
);

InfoItem.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

GroupInfo.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    groupInfo: PropTypes.shape({
        memberCount: PropTypes.number,
        joinedDate: PropTypes.string,
        eventsMatched: PropTypes.number,
        sharedInterests: PropTypes.arrayOf(PropTypes.string),
        members: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
        })),
    }).isRequired
};

export default GroupInfo;