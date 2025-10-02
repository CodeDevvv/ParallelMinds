import {
    ClockIcon,
    CheckCircleIcon,
    UsersIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';

const StatCard = ({stats}) => {
  return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Card 1: Ongoing Events */}
                <div className="bg-neutral-900 p-5 rounded-lg shadow-md border-l-4 border-sky-500 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-1">
                    <div>
                        <h3 className="text-sm font-medium text-neutral-400">Ongoing Events</h3>
                        <p className="text-3xl font-bold text-white mt-1">{stats.ongoingEvents}</p>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded-full">
                        <ClockIcon className="h-6 w-6 text-sky-500" />
                    </div>
                </div>

                {/* Card 2: Completed Events */}
                <div className="bg-neutral-900 p-5 rounded-lg shadow-md border-l-4 border-emerald-500 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1">
                    <div>
                        <h3 className="text-sm font-medium text-neutral-400">Completed Events</h3>
                        <p className="text-3xl font-bold text-white mt-1">{stats.completedEvents}</p>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded-full">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                    </div>
                </div>

                {/* Card 3: Users */}
                <div className="bg-neutral-900 p-5 rounded-lg shadow-md border-l-4 border-amber-500 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 ">
                    <div>
                        <h3 className="text-sm font-medium text-neutral-400">Users</h3>
                        <p className="text-3xl font-bold text-white mt-1">{stats.users}</p>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded-full">
                        <UsersIcon className="h-6 w-6 text-amber-500" />
                    </div>
                </div>

                {/* Card 4: Doctors */}
                <div className="bg-neutral-900 p-5 rounded-lg shadow-md border-l-4 border-rose-500 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-1">
                    <div>
                        <h3 className="text-sm font-medium text-neutral-400">Doctors</h3>
                        <p className="text-3xl font-bold text-white mt-1">{stats.doctors}</p>
                    </div>
                    <div className="bg-neutral-800 p-3 rounded-full">
                        <UserPlusIcon className="h-6 w-6 text-rose-500" />
                    </div>
                </div>
            </div>  )
}

export default StatCard