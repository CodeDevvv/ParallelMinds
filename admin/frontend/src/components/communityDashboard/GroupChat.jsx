import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Send, MessageSquare, Loader2, ShieldCheck, Megaphone, CalendarPlus } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../helpers/helpers';
import FullScreenLoader from '../../ui/FullScreenLoader';

const GroupChat = ({ isOpen, onClose, chats, isLoading }) => {
    const navigate = useNavigate()
    const { adminData } = useAuthStore()
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('');
    const [localCounter, setLocalCounter] = useState(0)

    useEffect(() => {
        if (chats) {
            setMessages(chats);
        }
    }, [chats]);
    const groupId = chats.length !== 0 ? chats[0].groupId : null
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);


    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        setLocalCounter(p => p + 1)

        const messageData = {
            message: newMessage,
            created_at: new Date(),
            messageType: 'admin',
            is_admin_message: true
        };

        socketRef.current.emit('sendMessage', messageData, (response) => {
            if (response.status === 'ok') {
                setNewMessage('');
            } else {
                toast.error(response.message);
            }
        });
    }

    useEffect(() => {
        if (!groupId) return;
        socketRef.current = io('http://localhost:3000/community', {
            auth: { group_id: groupId, user_id: adminData.id, full_name: 'admin' },
        });
        socketRef.current.on('newMessage', (incomingMessage) => {
            setMessages((prevMessages) => [...prevMessages, incomingMessage]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [chats, groupId, adminData.id]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-neutral-800 text-white shadow-xl h-[700px] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 border-b border-neutral-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Group Chat</h2>
                    <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-neutral-700">
                        <X size={20} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col h-full items-center justify-center text-neutral-400">
                            <FullScreenLoader message={"Fetching messages..."} />
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="flex flex-col h-full items-center justify-center text-neutral-500">
                            <MessageSquare size={48} className="mb-4" />
                            <h3 className="text-lg font-semibold">No messages yet</h3>
                            <p className="text-sm">Be the first to send a message to this group.</p>
                        </div>
                    ) : (
                        messages.map(chat => {
                            if (chat.messageType === 'system') {
                                return (
                                    <div key={chat._id} className="my-4 rounded-lg border border-sky-800/50 bg-neutral-700/30 p-4 text-center">
                                        <div className="flex w-fit mx-auto items-center gap-2 rounded-full bg-sky-900/50 px-3 py-1 text-xs text-sky-300">
                                            <Megaphone size={14} />
                                            <span>Event Alert!</span>
                                        </div>
                                        <p className="my-3 text-base text-neutral-200">{chat.message}</p>
                                        <button
                                            onClick={() => navigate('/events')}
                                            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
                                        >
                                            <CalendarPlus size={16} />
                                            Check Now
                                        </button>
                                    </div>
                                );
                            } else {
                                const isAdminMessage = chat.messageType === 'admin';
                                return (
                                    <div key={chat.id || localCounter} className={`flex items-end gap-3 ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-lg p-3 rounded-2xl shadow-md ${isAdminMessage
                                            ? 'bg-sky-800 text-white rounded-br-none'
                                            : 'bg-neutral-700 text-neutral-200 rounded-bl-none'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-xs font-bold ${isAdminMessage ? 'text-sky-300' : 'text-neutral-400'}`}>
                                                    {chat.senderName}
                                                </p>
                                                {isAdminMessage && <ShieldCheck size={12} className="text-sky-300" />}
                                            </div>
                                            <p className="text-base break-words">{chat.message}</p>
                                            <p className={`text-xs mt-1.5 text-right ${isAdminMessage ? 'text-sky-200/70' : 'text-neutral-500'}`}>
                                                {formatTime(chat.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                        })
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="flex-shrink-0 p-4 border-t border-neutral-700 bg-neutral-800">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            rows={1}
                            placeholder="Type your message as an Admin..."
                            className="flex-1 w-full rounded-full border-transparent bg-neutral-700 px-5 py-3 text-sm text-neutral-100 placeholder-neutral-400 transition resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                        />
                        <button
                            type="submit"
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white shadow-md transition-transform duration-200 hover:bg-sky-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500/80 disabled:bg-neutral-600 disabled:hover:scale-100"
                            disabled={!newMessage.trim()}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );

};

GroupChat.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    chats: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string,
        senderId: PropTypes.string.isRequired,
        message: PropTypes.any.isRequired,
        created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
        senderName: PropTypes.string.isRequired,
        isAdmin: PropTypes.bool,
        messageType: PropTypes.oneOf(['user', 'admin', 'system']),
    })).isRequired,
    isLoading: PropTypes.bool.isRequired,
};

export default GroupChat;