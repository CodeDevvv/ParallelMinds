import { ChevronDown, User, ShieldCheck } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

const TicketItem = ({ ticket }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isClosed = ticket.status === 'Closed';

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="border-b border-neutral-700/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 text-left transition-colors hover:bg-neutral-700/50"
            >
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                        <p className="font-semibold text-neutral-100">{ticket.subject}</p>
                        <p className="mt-1 text-xs text-neutral-400">
                            Submitted on: {formatDate(ticket.submitted_at)}
                        </p>
                    </div>

                    <div className="flex w-full items-center justify-between sm:w-auto sm:justify-end sm:gap-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${isClosed
                            ? 'bg-green-500/10 text-green-300'
                            : 'bg-yellow-500/10 text-yellow-300'
                            }`}>
                            {ticket.status}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="bg-neutral-800/60 p-4 md:p-6">
                    <div className="space-y-6">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-300">
                                <User size={16} />
                                <span>Your Query</span>
                            </div>
                            <p className="rounded-lg bg-neutral-900/70 p-3 text-sm text-neutral-300">
                                {ticket.message_text || "No query details provided."}
                            </p>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-300">
                                <ShieldCheck size={16} className={isClosed ? "text-green-400" : "hidden"} />
                                <span className={isClosed ? "text-green-400" : "hidden"}>Response</span>
                            </div>
                            <p className={isClosed ?"rounded-lg bg-neutral-900/70 p-3 text-sm text-neutral-200" : "ounded-lg bg-neutral-900/70 p-3 text-sm text-neutral-200 opacity-15"}>
                                {ticket.admin_response || "We have received your request and are actively working to resolve it. You will hear from us soon."}
                            </p>

                            {ticket.responded_at && (
                                <p className="mt-1 text-right text-xs text-neutral-500">
                                    Responded on: {formatDate(ticket.responded_at)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

TicketItem.propTypes = {
    ticket: PropTypes.shape({
        subject: PropTypes.string.isRequired,
        submitted_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
        responded_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        status: PropTypes.string.isRequired,
        admin_response: PropTypes.string,
        message_text: PropTypes.string
    }).isRequired
};

export default TicketItem;