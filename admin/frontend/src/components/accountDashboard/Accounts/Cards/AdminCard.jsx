import { useState } from "react";
import { getInitials } from "../../../../helpers/helpers";
import ConfirmationDialog from "../../../../ui/ConfirmationDialogBox";
import { TrashIcon } from "@heroicons/react/24/outline";

const AdminCard = ({ admin, handleDelete }) => {
    const [isAlertBoxOpen, setIsAlertBoxOpen] = useState(false)
    const handleConfirm = (confirmed) => {
        if (confirmed) {
            handleDelete(admin._id, admin.name)
        }
        setIsAlertBoxOpen(false)
    }
    return (
        <div key={admin._id} className="bg-surface-100 border border-border rounded-xl p-5 text-center flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out">
            <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">{getInitials(admin.name)}</span>
            </div>

            <div className="flex-grow">
                <h3 className="text-lg font-bold text-text-primary">{admin.name}</h3>
                <p className="text-text-secondary text-sm break-all">{admin.email}</p>
            </div>

            <div className="p-2 mt-3.5">
                <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-white bg-red-800 transition-colors duration-200 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    onClick={() => setIsAlertBoxOpen(true)}
                    aria-label="Delete Account"
                >
                    <TrashIcon size={8} aria-hidden="true" />
                    <span>Delete Account</span>
                </button>
            </div>
            {isAlertBoxOpen && <ConfirmationDialog
                message={`Are you sure you want delete this admin - ${admin.name}`}
                onConfirm={handleConfirm}
                onClose={() => setIsAlertBoxOpen(false)}
            />}
        </div>
    )
}

export default AdminCard