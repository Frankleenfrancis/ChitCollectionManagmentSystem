import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function ProtectedRoute({
    children,
    allowedRoles = [],
}) {
    const { user, loading } = useAuth();

   
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    const token = localStorage.getItem("token");

 
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role validation
    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
    ) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}