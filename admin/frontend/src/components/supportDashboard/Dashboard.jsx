import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import config from '../../config';
import QueryCard from './Cards/QueryCard';
import FullScreenLoader from '../../ui/FullScreenLoader';
import PaginationNav from '../../ui/PaginationNav';

const Dashboard = () => {
    const [queries, setQueries] = useState([]);
    const [activeTab, setActiveTab] = useState('Open');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);
    const [isFetchQueryLoading, setIsFetchQueryLoading] = useState(false);

    const handleReplySubmit = async (id, responseText) => {
        try {
            setSubmittingId(id);
            const res = await axios.post(`${config.API_URL}/submitQueryResponse`, { id, admin_response: responseText });
            const { status, message } = res.data;
            if (status) {
                toast.success(message);
                if (activeTab === 'Open') {
                    setQueries(currentQueries => currentQueries.filter(q => q.id !== id));
                } else {
                    setQueries(currentQueries =>
                        currentQueries.map(q =>
                            q.id === id
                                ? { ...q, status: 'Closed', admin_response: responseText }
                                : q
                        )
                    );
                }
            } else {
                toast.error(message);
            }
        } catch (error) {
            console.log(error.message);
            toast.error("Server request failed. Please retry.");
        } finally {
            setSubmittingId(null);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setQueries([]);
        setCurrentPage(1);
        setHasMore(true); 
    };

    useEffect(() => {
        const fetchQueries = async () => {
            try {
                setIsFetchQueryLoading(true);
                const response = await axios.get(`${config.API_URL}/fetchQueries?status=${activeTab}&page=${currentPage}`);
                const { status, message, data, hasMore: moreAvailable } = response.data;
                if (status) {
                    setQueries(data);
                    setHasMore(moreAvailable);
                } else {
                    toast.error(message);
                    setQueries([]);
                }
            } catch (error) {
                console.log(error.message);
                toast.error("Server request failed. Please retry.");
            } finally {
                setIsFetchQueryLoading(false);
            }
        };
        fetchQueries();
    }, [activeTab, currentPage]);

    return (
        <div className="flex-1 text-white p-6 md:p-8 lg:p-10">
            <div className="max-w-5xl mx-auto">
                <header className="pb-6 border-b border-neutral-800 mb-8">
                    <h1 className="text-3xl font-bold text-white">Support Dashboard</h1>
                    <p className="text-neutral-400 mt-1">
                        Managing user queries.
                    </p>
                </header>
                <div className="mb-6 flex items-center border-b border-neutral-700">
                    {['Open', 'Closed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                                ? 'border-b-2 border-sky-500 text-sky-400'
                                : 'text-neutral-400 hover:text-neutral-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <main className="space-y-6">
                    {
                        isFetchQueryLoading ? <FullScreenLoader message={"Fetching queries..."} />
                            :
                            queries.length > 0 ? (
                                queries.map(query => (
                                    <QueryCard
                                        key={query.id}
                                        query={query}
                                        onReplySubmit={handleReplySubmit}
                                        isLoading={submittingId === query.id}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-10 bg-neutral-800 rounded-lg">
                                    <CheckCircle size={48} className="mx-auto text-green-500" />
                                    <h3 className="mt-4 text-xl font-semibold text-neutral-200">
                                        All Caught Up!
                                    </h3>
                                    <p className="mt-1 text-neutral-400">There are no {activeTab.toLowerCase()} tickets.</p>
                                </div>
                            )
                    }
                </main>

                <PaginationNav
                    onNext={() => setCurrentPage(p => p + 1)}
                    onPrev={() => setCurrentPage(p => p - 1)}
                    hideNext={!hasMore}
                    hidePrev={currentPage === 1}
                />

            </div>
        </div>
    );
};

export default Dashboard;