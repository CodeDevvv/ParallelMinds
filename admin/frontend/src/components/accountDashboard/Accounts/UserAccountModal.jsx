import PropTypes from 'prop-types';
import {
    X, User, Cake, MapPin, ClipboardList,
    HeartPulse, Sparkles, Trash2, CheckCircle, XCircle,
    VenusAndMars
} from 'lucide-react';
import { useState } from 'react';
import ConfirmationDialog from '../../../ui/ConfirmationDialogBox';


const UserAccountModal = ({ isOpen, onClose, user, onDelete }) => {
    const [isAlertBoxOpen, setIsAlertBoxOpen] = useState(false);
    if (!isOpen || !user) return null;

    const handleConfirm = (confirmed) => {
        if (confirmed) {
            onDelete(user._id);
            onClose();
        }
    };
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-neutral-800 text-white shadow-xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-6 border-b border-neutral-700 flex items-center gap-4">
                    <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-neutral-700">
                        <X size={20} />
                    </button>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-900/70">
                        <User size={24} className="text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.personalInfo?.name || 'User Profile'} {`(Id: ${user._id})`}</h2>
                        <p className="text-sm text-neutral-400">{user.email}</p>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-lg font-semibold mb-4 text-neutral-200">Personal Information</h3>
                                <div className="space-y-4 rounded-lg bg-neutral-700/30 p-4">
                                    <DetailItem icon={Cake} label="Date of Birth" value={user.personalInfo?.dateOfBirth ? new Date(user.personalInfo.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'} />
                                    <DetailItem icon={VenusAndMars} label="Gender" value={user.personalInfo?.gender} />
                                </div>
                            </section>
                            <section>
                                <h3 className="text-lg font-semibold mb-4 text-neutral-200">Location Details</h3>
                                <div className="space-y-4 rounded-lg bg-neutral-700/30 p-4">
                                    <DetailItem icon={MapPin} label="Address" value={user.location?.address} />
                                    <DetailItem label="City" value={user.location?.city} />
                                    <DetailItem label="Group ID" value={user.groupId || 'Not assigned'} />
                                </div>
                            </section>
                        </div>

                        <section>
                            <h3 className="text-lg font-semibold mb-4 text-neutral-200">Questionnaire Results</h3>
                            <div className="space-y-4 rounded-lg bg-neutral-700/30 p-4">
                                <DetailItem
                                    icon={ClipboardList}
                                    label="Status"
                                    value={
                                        <span className={`flex items-center gap-2 font-semibold ${user.questionnaire?.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {user.questionnaire?.completed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            {user.questionnaire?.completed ? 'Completed' : 'Pending'}
                                        </span>
                                    }
                                />
                                {
                                    user.questionnaire?.completed ?
                                        <div>
                                            <DetailItem icon={HeartPulse} label="PHQ-9 Score (Depression)" value={`${user.questionnaire?.phq9Assessment?.totalScore} - ${user.questionnaire?.phq9Assessment?.category}`} />
                                            <DetailItem icon={HeartPulse} label="GAD-7 Score (Anxiety)" value={`${user.questionnaire?.gad7Assessment?.totalScore} - ${user.questionnaire?.gad7Assessment?.category}`} />
                                            <DetailItem icon={Sparkles} label="Interests" value={<TagList items={user.questionnaire?.interests?.responses} />} />
                                        </div>
                                        :
                                        <div className="space-y-4 rounded-lg bg-neutral-700/30 p-4">
                                            <h1>Questionnaire pending</h1>
                                        </div>
                                }
                            </div>
                        </section>
                    </div>
                </main>

                <footer className="flex-shrink-0 p-4 border-t border-neutral-700 flex justify-end">
                    <button
                        onClick={() => setIsAlertBoxOpen(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                    >
                        <Trash2 size={16} />
                        Delete User
                    </button>
                </footer>
            </div>
            {isAlertBoxOpen && <ConfirmationDialog
                message={`Are you sure you want delete this user - ${user?.personalInfo?.name}?`}
                onClose={() => setIsAlertBoxOpen(false)}
                onConfirm={handleConfirm}
            />}
        </div>
    );
};

UserAccountModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    user: PropTypes.shape({
        _id: PropTypes.string,
        email: PropTypes.string,
        personalInfo: PropTypes.shape({
            name: PropTypes.string,
            dateOfBirth: PropTypes.string,
            gender: PropTypes.string,
        }),
        location: PropTypes.shape({
            address: PropTypes.string,
            city: PropTypes.string,
        }),
        questionnaire: PropTypes.shape({
            completed: PropTypes.bool,
            phq9Assessment: PropTypes.shape({
                totalScore: PropTypes.number,
                category: PropTypes.string,
            }),
            gad7Assessment: PropTypes.shape({
                totalScore: PropTypes.number,
                category: PropTypes.string,
            }),
            interests: PropTypes.shape({
                responses: PropTypes.arrayOf(PropTypes.string),
            }),
        }),
        groupId: PropTypes.string,
    }),
};

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-sky-400 mt-1" />}
        <div>
            <p className="text-sm font-semibold text-neutral-400">{label}</p>
            <div className="text-base text-neutral-100">{value || 'Not provided'}</div>
        </div>
    </div>
);
DetailItem.propTypes = { icon: PropTypes.elementType, label: PropTypes.string, value: PropTypes.node };

const TagList = ({ items }) => (
    <div className="flex flex-wrap gap-2">
        {items && items.length > 0 ? (
            items.map(item => (
                <span key={item} className="rounded-full bg-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300">
                    {item}
                </span>
            ))
        ) : (
            <span className="text-xs text-neutral-500">None selected</span>
        )}
    </div>
);
TagList.propTypes = { items: PropTypes.arrayOf(PropTypes.string) };

export default UserAccountModal;