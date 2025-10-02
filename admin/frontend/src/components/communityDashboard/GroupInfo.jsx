import PropTypes from 'prop-types';
import {
    X, Users, Tag, HeartPulse, Settings, CalendarCheck, CheckCircle, XCircle
} from 'lucide-react';

const Section = ({ title, children, icon: Icon }) => (
    <section>
        <h3 className="mb-3 flex items-center gap-3 text-lg font-semibold text-neutral-200">
            {Icon && <Icon size={20} className="text-sky-400" />}
            {title}
        </h3>
        <div className="space-y-4 rounded-lg bg-neutral-700/40 p-4">
            {children}
        </div>
    </section>
);
Section.propTypes = { title: PropTypes.string, children: PropTypes.node, icon: PropTypes.elementType };

const DetailItem = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-neutral-400">{label}</p>
        <div className="text-base text-neutral-100">{value || 'N/A'}</div>
    </div>
);
DetailItem.propTypes = { label: PropTypes.string, value: PropTypes.node };

const TagList = ({ items }) => (
    <div className="flex flex-wrap gap-2">
        {items && items.length > 0 ? (
            items.map(item => (
                <span key={item} className="rounded-full bg-neutral-600 px-3 py-1 text-xs font-medium text-neutral-200">
                    {item}
                </span>
            ))
        ) : (
            <span className="text-sm text-neutral-500">None selected</span>
        )}
    </div>
);
TagList.propTypes = { items: PropTypes.arrayOf(PropTypes.string) };


const GroupInfo = ({ isOpen, onClose, group }) => {
    if (!isOpen || !group) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-neutral-800 text-white shadow-xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-6 border-b border-neutral-700">
                    <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-neutral-700">
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold">Group Details</h2>
                    <p className="font-mono text-sm text-neutral-400 mt-1">ID: {group._id}</p>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <Section title="Members" icon={Users}>
                                <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                                    {group.membersId && group.membersId.length > 0 ? (
                                        group.membersId.map(memberId => (
                                            <div key={memberId} className="group flex items-center justify-between rounded p-2 hover:bg-neutral-700/50">
                                                <span className="font-mono text-sm text-neutral-300">{memberId}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-neutral-500">No members in this group.</p>
                                    )}
                                </div>
                            </Section>

                            <Section title="Settings" icon={Settings}>
                                <DetailItem label="Current / Max Size" value={`${group.settings?.currentSize} / ${group.settings?.maxSize}`} />
                                <DetailItem label="Status" value={
                                    <span className={`flex items-center gap-2 font-semibold ${group.settings?.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                                        {group.settings?.isOpen ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        {group.settings?.isOpen ? 'Open for new members' : 'Closed'}
                                    </span>
                                } />
                            </Section>
                        </div>

                        <div className="space-y-8">
                            <Section title="Group Profile" icon={HeartPulse}>
                                <DetailItem label="Avg PHQ-9 Score" value={group.groupProfile?.avgPHQ9Score} />
                                <DetailItem label="Avg GAD-7 Score" value={group.groupProfile?.avgGAD7Score} />
                                <DetailItem label="Common Life Transitions" value={<TagList items={group.groupProfile?.commonLifeTransitions} />} />
                                <DetailItem label="Shared Interests" value={<TagList items={group.groupProfile?.sharedInterests} />} />
                            </Section>

                            <Section title="Matched Events" icon={CalendarCheck}>
                                <DetailItem label="Total Matched" value={group.matchedEvents?.length || 0} />
                            </Section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

GroupInfo.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    group: PropTypes.shape({
        _id: PropTypes.string,
        membersId: PropTypes.arrayOf(PropTypes.string),
        groupProfile: PropTypes.shape({
            avgPHQ9Score: PropTypes.number,
            avgGAD7Score: PropTypes.number,
            commonLifeTransitions: PropTypes.arrayOf(PropTypes.string),
            sharedInterests: PropTypes.arrayOf(PropTypes.string),
        }),
        settings: PropTypes.shape({
            maxSize: PropTypes.number,
            currentSize: PropTypes.number,
            isOpen: PropTypes.bool,
        }),
        matchedEvents: PropTypes.arrayOf(PropTypes.string),
    }),
};

export default GroupInfo;