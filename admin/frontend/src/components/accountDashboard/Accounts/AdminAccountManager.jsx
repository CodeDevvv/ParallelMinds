import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../../../config';
import Loader from '../../../ui/Loader';
import AdminCard from './Cards/AdminCard';
import FullScreenLoader from '../../../ui/FullScreenLoader';

const AdminAccountManager = () => {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleted, setIsDeleted] = useState(true)

    useEffect(() => {
        let isMounted = true;
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${config.API_URL}/fetchUsers?role=admins`)
                if (isMounted) {
                    const { status, data, message } = res.data
                    if (status) {
                        setAdmins(data || []);
                    } else {
                        toast.error(message || 'Failed to fetch admins.');
                    }
                }
            } catch (error) {
                if (!isMounted) return;
                console.log(error.message)
                toast.error("Server request failed. Please retry.")
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        fetchUsers()
        return () => { isMounted = false; };
    }, [isDeleted]);

    const handleDelete = async (admin_id, name) => {
        try {
            const res = await axios.delete(`${config.API_URL}/deleteAccount?role=admin&id=${admin_id}`)
            const { status, message } = res.data
            if (status) {
                toast.success(name + " admin deleted successfully.")
                setIsDeleted(!isDeleted)
            } else {
                toast.error(message)
            }
        } catch (error) {
            console.log(error.message)
            toast.error("Server request failed. Please retry.")
        }
    }

    if (isLoading) return <FullScreenLoader message={"Fetching Admin Accounts.."} />

    return (
        <section className="p-4 sm:p-6">
            {admins.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {admins.map(admin =>
                        <AdminCard
                            admin={admin}
                            handleDelete={handleDelete}
                        />
                    )}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface-100 border-dashed border-border rounded-lg">
                    <h1 className="text-xl font-semibold text-text-primary">No Admin Users Found</h1>
                    <p className="text-text-secondary mt-2">There are no administrators to display.</p>
                </div>
            )}

        </section>
    );
};

export default AdminAccountManager;