import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user, customer, isAdmin } = useAuth();
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/**" replace />;
    }

    return children;


    // if (!user) return <Navigate to="/" replace />;
    // if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
    // return children;
}
