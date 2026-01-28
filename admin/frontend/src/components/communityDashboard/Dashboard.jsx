import { FolderKanban } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import config from '../../config';
import PaginationNav from '../../ui/PaginationNav';
import GroupInfo from './GroupInfo';
import GroupChat from './GroupChat';
import GroupCard from './Cards/GroupCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [group, setGroup] = useState([]);
    const [chats, setChats] = useState([]);
    const [groups, setGroups] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
    const [filters, setFilters] = useState({
        sortOrder: 'newest',
        status: 'all',
        search: ''
    })
    const [searchQuery, setSearchQuery] = useState('')

    const handleViewDetails = (group) => {
        setIsViewDetailsOpen(true);
        setIsChatOpen(false);
        setGroup(group);
    };

    const handleViewChat = async (groupId) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${config.API_URL}/fetchChats?groupId=${groupId}`);
            const { status, chats, message } = res.data;
            if (status) {
                setChats(chats);
            } else {
                toast.error(message);
            }
        } catch (error) {
            console.log(error.message);
            toast.error("Server request failed. Please retry.");
        } finally {
            setIsViewDetailsOpen(false);
            setIsChatOpen(true);
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }))
        setCurrentPage(1)
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        setFilters(prev => ({
            ...prev,
            search: searchQuery
        }))
        setCurrentPage(1)
    }

    useEffect(() => {
        const fetchGroups = async () => {
            const queryParams = new URLSearchParams({
                page: currentPage,
                sortOrder : filters.sortOrder,
                status : filters.status || "",
                searchQuery : filters.search | ""
            }).toString()
            try {
                const res = await axios.get(`${config.API_URL}/fetchGroups?${queryParams}`);
                const { status, message, groups, hasMore } = res.data;
                if (status) {
                    setGroups(groups);
                    setHasMore(hasMore);
                } else {
                    toast.error(message);
                }
            } catch (error) {
                console.log(error.message);
                toast.error("Server request failed. Please retry.");
            }
        };
        fetchGroups();
    }, [currentPage, filters]);

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
            <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow">
                <header className="pb-6 border-b border-neutral-800 mb-8">
                    <h1 className="text-3xl font-bold text-white">Group Management</h1>
                    <p className="text-neutral-400 mt-1">
                        Oversee and manage all active user groups on the platform.
                    </p>
                </header>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select
                            name="sort"
                            value={filters.sort}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                        >
                            <option value="newest">Sort by: Newest</option>
                            <option value="oldest">Sort by: Oldest</option>
                        </select>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                        >
                            <option value="all">Status: All</option>
                            <option value="open">Status: Open</option>
                            <option value="closed">Status: Closed</option>
                        </select>
                    </div>

                    <form
                        onSubmit={handleSearchSubmit}
                        className="w-full md:w-auto flex items-center"
                    >
                        <input
                            type="search"
                            placeholder="Search by group ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full md:w-64 px-3 bg-neutral-800 border border-neutral-700 rounded-l-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors rounded-r-none border-r-0"
                        />
                        <button
                            type="submit"
                            className="h-10 px-4 flex items-center bg-sky-600 rounded-r-lg hover:bg-sky-700 transition-colors"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                        </button>
                    </form>
                </div>

                <main className="flex-grow">
                    {groups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {groups.map(group => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    onViewDetails={handleViewDetails}
                                    onViewChat={() => handleViewChat(group.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-lg p-8 text-center">
                            <FolderKanban size={48} className="text-neutral-600" />
                            <h2 className="mt-4 text-xl font-semibold text-white">No Groups Found</h2>
                            <p className="mt-2 text-neutral-400 max-w-sm">
                                It looks like no groups have been created yet. They will appear here once they are formed.
                            </p>
                        </div>
                    )}
                </main>

                <footer className="mt-auto pt-8">
                    <PaginationNav
                        onNext={() => setCurrentPage(p => p + 1)}
                        onPrev={() => setCurrentPage(p => p - 1)}
                        hidePrev={currentPage === 1}
                        hideNext={!hasMore}
                    />
                </footer>
            </div>

            {isViewDetailsOpen && <GroupInfo
                isOpen={isViewDetailsOpen}
                onClose={() => setIsViewDetailsOpen(false)}
                group={group}
            />}
            {isChatOpen && <GroupChat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                chats={chats}
                isLoading={isLoading}
            />}
        </div>
    );
};

export default Dashboard;