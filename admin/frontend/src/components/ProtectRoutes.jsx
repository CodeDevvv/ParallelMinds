import React from 'react'
import { useAuthStore } from '../store/store'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNavBar from './BottomNavBar'
import DraggableNav from './DraggableNav'

const ProtectRoutes = () => {
    const { isAuthenticated } = useAuthStore()

    if (isAuthenticated) {
        return (<div>
            {/* <Sidebar /> */}
            {/* <BottomNavBar /> */}
            <DraggableNav />
            <Outlet />
        </div>
        )
    }

    return <Navigate to="/authenticate" replace />
}

export default ProtectRoutes