import { useState, useEffect, useRef } from 'react';
import { Send, Info, CalendarPlus, ShieldCheck, Megaphone, MessageSquareText } from 'lucide-react';
import axios from 'axios';

import config from '../../../config';
import toast from 'react-hot-toast';
import GroupInfo from './GroupInfo';

import { io } from 'socket.io-client';
import { useUser } from '../utils/dataQuery';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../../utils/helperFunctions';
import Loader from '../../../ui/Loader';

const Community = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
    const [groupInfo, setGroupInfo] = useState({});
    const messagesEndRef = useRef(null);
    const { data: user } = useUser();
    const socketRef = useRef(null);
    const navigate = useNavigate()
    const [localCounter, setLocalCounter] = useState(0)

    useEffect(() => {
        if (!user) return;
        const fetchHistoryAndGroupInfo = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${config.API_URL}/api/chat/history`, {
                    withCredentials: true,
                });
                const { status, message, chatHistory, groupInfo } = response.data;
                if (status) {
                    setMessages(chatHistory);
                    setGroupInfo(groupInfo)
                } else {
                    toast.error(message);
                }
            } catch (error) {
                console.log(error.message)
                toast.error("Server request failed. Please retry.")
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistoryAndGroupInfo();
    }, [user]);

    useEffect(() => {
        if (!user || !user.groupId) return;
        socketRef.current = io('http://localhost:3000/community', {
            auth: { group_id: user.groupId },
        });
        socketRef.current.on('newMessage', (incomingMessage) => {
            setMessages((prevMessages) => [...prevMessages, incomingMessage]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        setLocalCounter(p => p + 1)
        const messageData = {
            groupId: user.groupId,
            senderId: user._id,
            message: newMessage,
            timestamp: new Date(),
            senderName: user.personalInfo.name,
            messageType: 'user'
        };

        socketRef.current.emit('sendMessage', messageData, (response) => {
            if (response.status === 'ok') {
                setNewMessage('');
            } else {
                toast.error(response.message);
            }
        });
    };




    return (
        <>
            <div className="ml-64 flex h-screen flex-col bg-gray-50 dark:bg-neutral-900">
                <header className="flex items-center justify-between border-b border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-lg dark:border-neutral-700/80 dark:bg-neutral-800/80">
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-600 font-bold text-white shadow-md">
                            G
                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-neutral-800" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800 dark:text-neutral-100">
                                Group Chat
                            </h1>
                            <p className="text-xs font-medium text-green-500 dark:text-green-400">
                                Active
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsGroupInfoOpen(true)}
                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                        <Info size={25} />
                    </button>
                </header>

                <main className="flex-1 space-y-4 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center text-gray-500 dark:text-neutral-400">
                            <Loader />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-gray-500 dark:text-neutral-400">
                            <MessageSquareText size={64} className="text-gray-300 dark:text-neutral-600" />
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-neutral-200">
                                Welcome!
                            </h2>
                            <p className="max-w-xs text-sm text-gray-400 dark:text-neutral-500">
                                Be the first to break the ice. Every great conversation starts with a single message.
                            </p>
                        </div>

                    ) : (
                        messages.map((msg) => {
                            if (msg.messageType === 'system') {
                                return (
                                    <div key={msg._id} className="my-4 rounded-lg border border-sky-800/50 bg-neutral-700/30 p-4 text-center">
                                        <div className="flex w-fit mx-auto items-center gap-2 rounded-full bg-sky-900/50 px-3 py-1 text-xs text-sky-300">
                                            <Megaphone size={14} />
                                            <span>Event Alert</span>
                                        </div>
                                        <p className="my-3 text-base text-neutral-200">{msg.message}</p>
                                        <button
                                            onClick={() => navigate('/user/events')}
                                            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
                                        >
                                            <CalendarPlus size={16} />
                                            Check Now
                                        </button>
                                    </div>
                                );
                            } else {
                                const isSentByCurrentUser = msg.senderId === user?._id;
                                const isAdminMessage = msg.messageType === 'admin';
                                return (
                                    <div
                                        key={msg._id || localCounter}
                                        className={`flex items-end gap-3 my-2 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs rounded-2xl p-3 shadow-md md:max-w-md ${isSentByCurrentUser
                                                ? 'rounded-br-none bg-sky-600 text-white'
                                                : isAdminMessage
                                                    ? 'rounded-bl-none bg-purple-900/50 border border-purple-700 text-neutral-200'
                                                    : 'rounded-bl-none bg-white text-gray-800 dark:bg-neutral-700 dark:text-neutral-200'

                                                }`}
                                        >
                                            {!isSentByCurrentUser && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className={`text-xs font-bold ${isAdminMessage ? 'text-purple-300' : 'text-sky-500 dark:text-sky-400'}`}>
                                                        {msg.senderName}
                                                    </p>
                                                    {isAdminMessage && <ShieldCheck size={12} className="text-purple-300" />}
                                                </div>
                                            )}
                                            <p className="break-words text-base">{msg.message}</p>
                                            <p
                                                className={`mt-1.5 text-right text-xs ${isSentByCurrentUser
                                                    ? 'text-sky-100/80'
                                                    : 'text-gray-400 dark:text-neutral-400'
                                                    }`}
                                            >
                                                {formatTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                        })
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="border-t border-gray-200 bg-white/80 p-4 backdrop-blur-lg dark:border-neutral-700/80 dark:bg-neutral-800/80">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 w-full rounded-full border-transparent bg-gray-100 px-5 py-3 text-sm text-gray-800 placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-sky-500/80 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
                        />
                        <button
                            type="submit"
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white shadow-md transition-transform duration-200 hover:bg-sky-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500/80 disabled:bg-gray-300 disabled:hover:scale-100 dark:disabled:bg-neutral-600"
                            disabled={!newMessage.trim()}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </footer>
            </div>

            <GroupInfo
                isOpen={isGroupInfoOpen}
                onClose={() => setIsGroupInfoOpen(false)}
                groupInfo={groupInfo}
            />
        </>
    );
};

export default Community