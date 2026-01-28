import React, { useEffect, useState } from 'react'
import axios from 'axios'
import config from '../../config'
import { Edit3, FileText, HelpCircle, Star, Stethoscope, UserPlus } from 'lucide-react'

const getHoursElapsed = (createdAt) => {
    createdAt = new Date(createdAt)
    const now = new Date();
    const diffMs = now - createdAt;
    const diffMinutes = diffMs / (1000 * 60);
    if (diffMinutes < 1) {
        const diffSeconds = Math.floor(diffMs / 1000);
        return `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 60) {
        return `${Math.floor(diffMinutes)} minutes ago`;
    } else {
        const diffHours = diffMinutes / 60;
        return `${diffHours.toFixed(1)} hours ago`;
    }
}

const RecentActivity = () => {
    const [logs, setLogs] = useState([])
    const [isloading, setIsLoading] = useState(false)
    useEffect(() => {
        const fetchLog = async () => {
            setIsLoading(true)
            try {
                const res = await axios.get(`${config.API_URL}/fetchLogs`)
                setLogs(res.data.systemLogs)
            } catch (error) {
                console.log(error.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchLog()
    }, [])

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Recent Activity </h2>
            </div>

            <div className="bg-surface-100 border border-border rounded-lg p-6">
                {(() => {
                    const logConfig = {
                        user_registered: { Icon: UserPlus, color: 'text-green-400', bgColor: 'bg-green-900/50' },
                        feedback_submitted: { Icon: Star, color: 'text-yellow-400', bgColor: 'bg-yellow-900/50' },
                        query_submitted: { Icon: HelpCircle, color: 'text-sky-400', bgColor: 'bg-sky-900/50' },
                        doctor_registered: { Icon: Stethoscope, color: 'text-blue-400', bgColor: 'bg-blue-900/50' },
                        user_profile_updated: { Icon: Edit3, color: 'text-purple-400', bgColor: 'bg-purple-900/50' },
                        default: { Icon: FileText, color: 'text-neutral-400', bgColor: 'bg-neutral-700' }
                    };

                    if (isloading) {
                        return <p className="text-center text-text-muted">Loading logs...</p>;
                    }

                    if (logs.length === 0) {
                        return (
                            <div className="text-center py-8">
                                <FileText size={40} className="mx-auto text-neutral-600" />
                                <h3 className="mt-4 text-lg font-semibold text-text-primary">No Activity Yet</h3>
                                <p className="mt-1 text-sm text-text-muted">Recent activity will be displayed here.</p>
                            </div>
                        );
                    }

                    return (
                        <div className="space-y-6">
                            {logs.map((log, index) => {
                                const { Icon, color, bgColor } = logConfig[log.eventType] || logConfig.default;
                                return (
                                    <div key={log._id || index} className="relative flex items-start gap-4">
                                        {index < logs.length - 1 && (
                                            <div className="absolute left-4 top-10 h-full w-0.5 bg-border" />
                                        )}

                                        <div className={`z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${bgColor}`}>
                                            <Icon size={16} className={color} />
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-text-primary text-sm">{log.description}</p>
                                            <p className="text-text-muted text-xs mt-1">{getHoursElapsed(log.created_at)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
        </section>
    )
}

export default RecentActivity

