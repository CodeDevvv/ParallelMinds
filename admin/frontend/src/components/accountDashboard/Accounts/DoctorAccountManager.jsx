// import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
// import React, { useEffect, useState } from 'react'
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import Loader from '../../ui/Loader';
// import config from '../../config';

// TODO: FILTERING , SEARCH , PAGINATION

const DoctorAccountManager = () => {
    // const [doctorFilter, setDoctorFilter] = useState({ specialization: '', sort: 'new' });
    // const [doctorSearch, setDoctorSearch] = useState('');
    // const [doctors, setDoctors] = useState([])
    // const [isLoading, setIsLoading] = useState(false)

    // useEffect(() => {
    //     let isMounted = true
    //     setIsLoading(true)

    //     const fetchUsers = async () => {
    //         try {
    //             const res = axios.get(`${config.API_URL}/fetchUsers?role=doctor`)
    //             if (isMounted) {
    //                 if (res.data.status) {
    //                     // setDoctors(res.data.doctors)
    //                 } else {
    //                     toast.error(res.data.message)
    //                 }
    //             }
    //         } catch (error) {
    //             if (!isMounted) return;
    //             console.log(error.message)
    //             toast.error("Server request failed. Please retry.")

    //         } finally {
    //             if (isMounted) setIsLoading(false)
    //         }
    //     }
    //     fetchUsers()
    //     return () => { isMounted = false; };
    // }, [])

    // const renderUserCard = (user, extraFields = []) => (
    //     <div key={user.id}
    //         className="bg-surface-100 border border-border rounded-lg p-4 hover:shadow-lg transition"
    //     >
    //         <h3 className="text-lg font-semibold mb-2">{user.name}</h3>
    //         {extraFields.map(f => (
    //             <p key={f.key} className="text-text-muted text-sm mb-1">
    //                 <strong>{f.label}:</strong> <span className="text-text-primary">{user[f.key]}</span>
    //             </p>
    //         ))}
    //         <p className="text-text-muted text-sm"><strong>Joined:</strong> <span className="text-text-primary">{new Date(user.joinedOn).toLocaleDateString('en-GB', {
    //             day: '2-digit',
    //             month: 'short',
    //             year: 'numeric'
    //         }).replace(/ /g, '-')}</span></p>        </div>
    // );

    // if (isLoading) return <Loader />

    return (
        <section className="mb-12">
            <div>
                <h1>UnderDevlopment</h1>
                {/* <div className="flex flex-wrap items-center justify-between mb-4 space-y-2">
                    <div className="flex space-x-2">
                        <select
                            value={doctorFilter.specialization}
                            onChange={e => setDoctorFilter(f => ({ ...f, specialization: e.target.value }))}
                            className="px-3 py-2 bg-surface-200 border border-border rounded"
                        >
                            <option value="">All Specializations</option>
                            <option>Cardiology</option><option>Neurology</option><option>General</option><option>Pediatrics</option>
                        </select>
                        <select
                            value={doctorFilter.sort}
                            onChange={e => setDoctorFilter(f => ({ ...f, sort: e.target.value }))}
                            className="px-3 py-2 bg-surface-200 border border-border rounded"
                        >
                            <option value="new">Newest</option>
                            <option value="old">Oldest</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Search doctors..."
                            value={doctorSearch}
                            onChange={e => setDoctorSearch(e.target.value)}
                            className="px-3 py-2 bg-surface-200 border border-border rounded w-64"
                        />
                        <button className="p-2 bg-surface-200 rounded hover:bg-surface-300">
                            <ChevronLeftIcon className="w-5 h-5 text-text-secondary" />
                        </button>
                        <button className="p-2 bg-surface-200 rounded hover:bg-surface-300">
                            <ChevronRightIcon className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(doctors, doctorFilter, doctorSearch, ['location', 'specialization'])
                        .map(u => renderUserCard(u, [{ key: 'specialization', label: 'Specialization' }]))
                    }
                </div> */}
            </div>
        </section>)
}

export default DoctorAccountManager