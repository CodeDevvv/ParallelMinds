import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Edit, Save, X, Heart, Star, Repeat } from 'lucide-react';
import { useUser } from '../utils/dataQuery';
import { profileSchema } from '../../../utils/ValidationSchema';
import toast from 'react-hot-toast';
import axios from 'axios';
import config from '../../../config';
import { formatDate } from '../../../utils/helperFunctions';
import Loader from '../../../ui/Loader';


const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(null);
    const { data: userData, isLoading, error } = useUser();

    useEffect(() => {
        if (userData) {
            setProfile(userData);
        }
    }, [userData]);

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                [name]: value,
            },
        }));
    };

    const handleSave = async () => {
        try {
            const data = {
                name: profile.personalInfo.name,
                email: profile.email,
            };
            await profileSchema.validate(data, { abortEarly: false });

            try {
                const response = await axios.patch(`${config.API_URL}/api/user/updateProfile`, { data: data }, { withCredentials: true })
                const { status, message } = response.data
                if (status) {
                    toast.success('Profile saved successfully!');
                    setIsEditing(false);
                } else {
                    throw new Error(message)
                }
            } catch (error) {
                console.log(error.message)
                toast.error("Server request failed. Please retry.")
            }
        } catch (validationError) {
            const errors = validationError.inner.map(err => err.message).join('\n');
            toast.error(errors);
        }
    };

    const handleCancel = () => {
        setProfile(userData);
        setIsEditing(false);
    };

    const handleRetakeAssessment = () => {
        toast.error("Functionality not available at this time.")
    };

    if (isLoading) return <Loader />;
    if (error) return <div className="text-center p-10 text-red-400">Failed to load profile.</div>;
    if (!profile) return null; 

    return (
        <div className="flex-1 bg-neutral-900 text-white p-6 md:p-8 ml-64 lg:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-100">Your Profile</h1>
                    <p className="text-neutral-400 mt-1">
                        Manage your personal information, interests, and assessment history.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-neutral-800 p-6 rounded-lg shadow-md h-fit">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-neutral-100">Personal Information</h2>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="flex items-center text-sm text-green-400 hover:text-green-300">
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-neutral-400">Name</label>
                                    <input type="text" name="name" id="name" value={profile.personalInfo.name} onChange={handleInfoChange} className="w-full mt-1 bg-neutral-700 border-neutral-600 rounded-md p-2" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-neutral-400">Email (Read-only)</label>
                                    <input type="email" name="email" id="email" value={profile.email} readOnly className="w-full mt-1 bg-neutral-900 border-neutral-700 rounded-md p-2 text-neutral-400 cursor-not-allowed" />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button onClick={handleCancel} className="flex items-center text-sm px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 rounded-md"><X className="h-4 w-4 mr-1" /> Cancel</button>
                                    <button onClick={handleSave} className="flex items-center text-sm px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-md"><Save className="h-4 w-4 mr-1" /> Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center"><User className="h-5 w-5 mr-3 text-neutral-400" /><span className="text-neutral-200">{profile.personalInfo.name}</span></div>
                                <div className="flex items-center"><Mail className="h-5 w-5 mr-3 text-neutral-400" /><span className="text-neutral-200">{profile.email}</span></div>
                                <div className="flex items-center"><MapPin className="h-5 w-5 mr-3 text-neutral-400" /><span className="text-neutral-200">{profile.location.address}</span></div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-neutral-100">Interests & Life Events</h2>
                            <div className="mt-4 mb-4">
                                <h3 className="font-semibold text-neutral-300 flex items-center mb-2"><Heart className="h-4 w-4 mr-2 text-red-400" /> Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.questionnaire.interests.responses.map(interest => <span key={interest} className="bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full text-sm">{interest}</span>)}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-300 flex items-center mb-2"><Star className="h-4 w-4 mr-2 text-yellow-400" /> Life Events</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.questionnaire.lifeTransitions.responses.map(event => <span key={event} className="bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full text-sm">{event}</span>)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-neutral-100 mb-4">Assessment History</h2>
                            <div className="space-y-4">
                                <div className="border border-neutral-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                        <h4 className="font-semibold text-neutral-200">Questionnaire</h4>
                                        <p className="text-sm text-neutral-400">Last taken: {formatDate(profile.questionnaire.completedAt)} </p>
                                    </div>
                                    <button onClick={handleRetakeAssessment} className="mt-3 sm:mt-0 flex items-center text-sm bg-neutral-600 hover:bg-neutral-500 px-3 py-2 rounded-md transition-colors">
                                        <Repeat className="h-4 w-4 mr-1.5" /> Retake
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;