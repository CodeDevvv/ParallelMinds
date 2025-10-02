import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, ChevronDownIcon, ArrowUpIcon, ArrowDownIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import UserProfileModal from './UserAccountModal';
import config from '../../../config';
import Loader from '../../../ui/Loader';
import UserCard from './Cards/UserCard';
import PaginationNav from '../../../ui/PaginationNav';
import FullScreenLoader from '../../../ui/FullScreenLoader';

const UserAccountManager = () => {
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState([]);

    const [filters, setFilters] = useState({ sort: 'new' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('personalInfo.name');

    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [showClear, setShowClear] = useState(false)

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        const queryParams = new URLSearchParams({
            role: 'users',
            page: currentPage.toString(),
            search: filters.search || '',
            searchType: filters.searchType || '',
            sort: filters.sort,
        }).toString();
        console.log(queryParams)
        axios.get(`${config.API_URL}/fetchUsers?${queryParams}`)
            .then(res => {
                if (!isMounted) return;
                const { status, data, message, hasMore } = res.data;
                if (status) {
                    setUsers(data);
                    setHasMore(hasMore);
                } else {
                    toast.error(message || "Failed to fetch users.");
                }
            })
            .catch(err => {
                if (!isMounted) return;
                console.error(err);
                toast.error("An error occurred while fetching users.");
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    }, [currentPage, filters, isDeleted]);

    const handleSortChange = (sortValue) => {
        setFilters(prev => ({ ...prev, sort: sortValue }));
        setCurrentPage(1);
        setShowClear(true)
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery) return
        setFilters(prev => ({ ...prev, search: searchQuery, searchType: searchType }));
        setCurrentPage(1);
        setShowClear(true)
    };

    const handleClearFilters = () => {
        setFilters({ sort: 'new' })
        setSearchQuery('')
        setCurrentPage(1)
        setSearchType('personalInfo.name')
        setShowClear(false)
    }

    const handleDelete = async (userId) => {
        try {
            const res = await axios.delete(`${config.API_URL}/deleteAccount?role=user&id=${userId}`);
            const { status, message } = res.data;
            if (status) {
                toast.success(user.personalInfo.name + " user deleted.");
                setIsDeleted(!isDeleted);
            } else {
                toast.error(message);
            }
        } catch (error) {
            console.log(error.message);
            toast.error("Server request failed. Please retry.");
        }
    };

    if (isLoading) return <FullScreenLoader message={"Fetching Users Accounts"} />;

    return (
        <section>
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 text-sm font-semibold text-white rounded-lg hover:bg-neutral-700 transition-colors">
                            Sort by: {filters.sort === 'new' ? 'Newest' : 'Oldest'}
                            <ChevronDownIcon className="h-4 w-4" />
                        </Menu.Button>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-neutral-700 z-10">
                                <div className="p-1">
                                    <Menu.Item>{({ active }) => (<button onClick={() => handleSortChange('new')} className={`${active ? 'bg-neutral-700' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}> <ArrowDownIcon className="mr-2 h-5 w-5" /> Newest First </button>)}</Menu.Item>
                                    <Menu.Item>{({ active }) => (<button onClick={() => handleSortChange('old')} className={`${active ? 'bg-neutral-700' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}> <ArrowUpIcon className="mr-2 h-5 w-5" /> Oldest First </button>)}</Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                   {showClear && <button
                        onClick={handleClearFilters} 
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                        aria-label="Clear filters"
                    >
                        <XCircleIcon className="h-5 w-5" />
                        <span>Clear</span>
                    </button>}
                </div>


                <form onSubmit={handleSearchSubmit} className="w-full md:w-auto">
                    <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-800 
                   focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/50 
                   transition-all duration-200">

                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="h-10 pl-3 pr-2 bg-transparent text-sm text-white focus:outline-none"
                        >
                            <option value="personalInfo.name" className='bg-neutral-800 text-white'>Name</option>
                            <option value="email" className='bg-neutral-800 text-white'>Email</option>
                            <option value="location.address" className='bg-neutral-800 text-white'>Location</option>
                            <option value="groupId" className='bg-neutral-800 text-white'>Group ID</option>
                        </select>

                        <div className="h-5 w-px bg-neutral-600"></div>

                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full md:w-56 px-3 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                        />

                        <button
                            type="submit"
                            className="h-10 px-4 flex items-center bg-sky-600 rounded-r-lg hover:bg-sky-700 transition-colors"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </form>
            </div>
            {users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map((user) =>
                        <UserCard key={user._id} user={user} setIsOpen={() => setIsOpen(true)} setUser={(user) => setUser(user)} />
                    )}
                </div>
            ) : (
                <div className="text-center py-16 bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-lg">
                    <h2 className="text-xl font-semibold text-white">No Users Found</h2>
                    <p className="text-neutral-400 mt-2">Try adjusting your filters or search term.</p>
                </div>
            )}

            <PaginationNav
                onPrev={() => setCurrentPage(p => p - 1)}
                onNext={() => setCurrentPage(p => p + 1)}
                hideNext={!hasMore}
                hidePrev={currentPage === 1}
            />

            {isOpen && <UserProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} onDelete={(userId) => handleDelete(userId)} user={user} />}
        </section>
    );
};

export default UserAccountManager;