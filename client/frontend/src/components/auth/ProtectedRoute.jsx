import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../ui/Loader";
import toast from "react-hot-toast";
import config from "../../config";

const ProtectedRoute = () => {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const checkAuth = async () => {
            try {
                const res = await axios.get(`${config.API_URL}/api/auth/authorized`, {
                    withCredentials: true,
                });

                if (!isMounted) return;

                const { status, pendingQuestionnaire, message } = res.data;
                if (status) {
                    setIsAuthorized(true);
                } else if (pendingQuestionnaire) {
                    toast.error(message || "Please complete the questionnaire");
                    navigate("/questionnaire", { replace: true });
                } else {
                    toast.error(message || "Unauthorized");
                    navigate("/", { replace: true });
                }
            } catch (error) {
                console.error("Authorization check failed", error);
                if (isMounted) navigate("/", { replace: true });
            }
        };

        checkAuth();
        return () => {
            isMounted = false;
        };
    }, [navigate]);

    if (isAuthorized === null) {
        return <Loader />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
