// src/components/Sidebar.jsx

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const sidebarItems = [
        { label: "Dashboard", icon: "grid", path: "/dashboard" },
        { label: "My Chits", icon: "list", path: "/chits" },
        { label: "Payments", icon: "credit-card", path: "/payment" },
        { label: "Customers", icon: "users", path: "/customers" },
        { label: "Settings", icon: "settings", path: "/settings" },

        {
            label: "Logout",
            icon: "logout",
            action: "logout",
        },
    ];

    const iconClass = "w-5 h-5";

    const icons = {
        grid: (
            <svg
                viewBox="0 0 24 24"
                className={iconClass}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
            >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        ),

        list: (
            <svg
                viewBox="0 0 24 24"
                className={iconClass}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
            >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <circle cx="3" cy="6" r="1" />
                <circle cx="3" cy="12" r="1" />
                <circle cx="3" cy="18" r="1" />
            </svg>
        ),

        "credit-card": (
            <svg
                viewBox="0 0 24 24"
                className={iconClass}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
            >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        ),

        users: (
            <svg
                viewBox="0 0 24 24"
                className={iconClass}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),

        settings: (
            <svg
                viewBox="0 0 24 24"
                className={iconClass}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
            >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),

        logout: (
            <svg
                viewBox="0 0 24 24"
                className={iconClass}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 17l5-5-5-5"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12H9"
                />
            </svg>
        ),
    };

    return (

        <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">

            <div className="flex items-center gap-2 px-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-800 leading-tight">ChitFund Pro</div>
                    <div className="text-[10px] text-gray-400">Manage Investments</div>
                </div>
            </div>
            {/* Logo */}
            <div className="px-6 py-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-indigo-600">
                    ChitFund
                </h1>

                <p className="text-xs text-gray-400 mt-1">
                    {user?.role || "User"}
                </p>
            </div>

            {/* Menu */}
            <div className="flex-1 p-4 space-y-1">

                {sidebarItems.map((item) => {

                    const active =
                        item.path &&
                        location.pathname.startsWith(item.path);

                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                if (item.action === "logout") {
                                    handleLogout();
                                } else {
                                    navigate(item.path);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                ${active
                                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {icons[item.icon]}

                            <span className="text-sm">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}