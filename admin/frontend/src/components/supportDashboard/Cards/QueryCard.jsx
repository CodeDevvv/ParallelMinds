import { Send, ChevronDownIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { formatDate, formatTime } from '../../../helpers/helpers'; 
import { motion, AnimatePresence } from 'framer-motion';

const QueryCard = ({ query, onReplySubmit, isLoading }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [reply, setReply] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reply.trim()) {
            onReplySubmit(query.id , reply);
            setReply('');
            setIsExpanded(false);
        }
    };

    return (
        <div className="border border-neutral-800 rounded-lg shadow-sm transition-shadow hover:shadow-md">
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${query.status === 'Open' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50' : 'bg-green-900/50 text-green-300 border border-green-700/50'}`}>
                        {query.status}
                    </span>
                    <span className="font-semibold text-white">{query.subject}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-neutral-400">
                    <span title={query.user_id}>
                        {query.user_id ? query.user_id.slice(0, 8) : 'Unknown'}...
                    </span>
                    <span>{formatDate(query.submitted_at)}</span>
                    <ChevronDownIcon
                        size={20}
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-neutral-800 p-4 space-y-4">
                            <div>
                                <h4 className="font-semibold text-neutral-300 text-sm mb-1">User's Query:</h4>
                                <p className="text-neutral-400 bg-neutral-800/50 p-3 rounded-md text-sm whitespace-pre-wrap">{query.message_text}</p>
                                <p className="text-right text-xs text-neutral-500 mt-1">
                                    Submitted: {formatDate(query.submitted_at)} at {formatTime(query.submitted_at)}
                                </p>
                            </div>

                            {query.status === 'Closed' ? (
                                <div>
                                    <h4 className="font-semibold text-green-400 text-sm mb-1">Your Response:</h4>
                                    <p className="text-neutral-300 bg-green-900/20 border border-green-800/30 p-3 rounded-md text-sm whitespace-pre-wrap">
                                        {query.admin_response || "No response text available."}
                                    </p>
                                    {query.responded_at && (
                                        <p className="text-right text-xs text-neutral-500 mt-1">
                                            Responded: {formatDate(query.responded_at)} at {formatTime(query.responded_at)}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        rows={4}
                                        placeholder="Type your response here..."
                                        className="w-full rounded-md border-neutral-700 bg-neutral-900 p-3 text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-colors resize-none"
                                    />
                                    <div className="text-right">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                                            disabled={isLoading || !reply.trim()}
                                        >
                                            <Send size={16} />
                                            {isLoading ? "Submitting..." : "Submit Reply"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

QueryCard.propTypes = {
    query: PropTypes.shape({
        id: PropTypes.string,
        _id: PropTypes.string, 
        status: PropTypes.string,
        subject: PropTypes.string,
        user_id: PropTypes.string,
        submitted_at: PropTypes.string,
        message_text: PropTypes.string,
        admin_response: PropTypes.string,
        responded_at: PropTypes.string,
    }).isRequired,
    onReplySubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default QueryCard;