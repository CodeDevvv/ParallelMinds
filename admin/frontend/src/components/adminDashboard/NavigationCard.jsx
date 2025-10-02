import { Calendar, Plus, Edit3, Eye, Users, MessageCircle, Trash2, LifeBuoy, Send, CheckCircle, Info, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';

const navigationCards = [
    {
        title: 'Manage Events',
        description: 'Create, edit, and publish events. View attendee lists and manage event details.',
        link: '/admin/eventManagement',
        icon: Calendar,
        color: 'border-sky-500/50 hover:border-sky-500',
        iconColor: 'text-sky-500',
        actions: [
            { label: 'Create', icon: Plus },
            { label: 'Edit', icon: Edit3 },
            { label: 'View', icon: Eye }
        ]
    },
    {
        title: 'Manage Communities',
        description: 'Oversee user groups, view member lists, and monitor group activities across the platform.',
        link: '/admin/community',
        icon: Users,
        color: 'border-teal-500/50 hover:border-teal-500',
        iconColor: 'text-teal-500',
        actions: [
            { label: 'View Groups', icon: Eye },
            { label: 'Message Group', icon: MessageCircle },
            { label: 'Delete Group', icon: Trash2 }
        ]
    },
    {
        title: 'Support Tickets',
        description: 'Review and respond to user queries, manage ticket statuses, and provide assistance.',
        link: '/admin/support',
        icon: LifeBuoy,
        color: 'border-amber-500/50 hover:border-amber-500',
        iconColor: 'text-amber-500',
        actions: [
            { label: 'Reply', icon: Send },
            { label: 'Close Ticket', icon: CheckCircle },
            { label: 'View Details', icon: Info }
        ]
    },
    {
        title: 'User Management',
        description: 'Manage all user and admin accounts, view profiles, and handle account-related actions.',
        link: '/admin/userManagement',
        icon: UserCog,
        color: 'border-purple-500/50 hover:border-purple-500',
        iconColor: 'text-purple-500',
        actions: [
            { label: 'View Profile', icon: Eye },
            { label: 'Edit User', icon: Edit3 },
            { label: 'Delete User', icon: Trash2 }
        ]
    }
];


const NavigationCard = () => {
    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
                <p className="text-text-secondary text-sm">Navigate to different sections of your admin panel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {navigationCards.map((card, index) => (
                    <Link
                        key={index}
                        to={card.link}
                        className={`group block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${card.color}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-surface-100 ${card.iconColor}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div className="flex -space-x-2">
                                {card.actions.slice(0, 3).map((action, actionIndex) => (
                                    <div
                                        key={actionIndex}
                                        className="w-6 h-6 bg-surface-200 rounded-full flex items-center justify-center border-2 border-surface-50"
                                        title={action.label}
                                    >
                                        <action.icon className="w-3 h-3 text-text-muted" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-2 text-text-primary group-hover:text-text-primary">
                            {card.title}
                        </h3>
                        <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                            {card.description}
                        </p>

                        <div className="flex items-center text-sm text-text-muted">
                            <span>Click to manage</span>
                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </section>)
}

export default NavigationCard