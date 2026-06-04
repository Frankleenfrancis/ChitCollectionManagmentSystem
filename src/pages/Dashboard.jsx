import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { chitPlanApi } from "../api/chitPlanApi";
import { chitCollectionApi } from "../api/chitCollectionApi";
import { customerApi } from "../api/customerApi";
import CollectPayment from "../payment/Payment";
import RecordCollectionForm from "./RecordCollectionForm";

const sidebarItems = [
    { label: "Dashboard", icon: "grid", path: "/user/dashboard" },
    { label: "My Chits", icon: "user", path: "/user/customer/dashboard" },
    { label: "Payment", icon: "credit-card", path: "/user/dashboard/collections/payment/{id}" },
    { label: "Settings", icon: "settings" },
    { label: "Logout", icon: "logout", action: "logout" },
];

const statsCards = [
    {
        title: "Total Invested",
        value: "$45,000",
        change: "+12%",
        sub: "vs last month",
        color: "text-blue-500",
        bg: "bg-blue-50",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
            </svg>
        ),
    },
    {
        title: "Current Valuation",
        value: "$48,200",
        change: "+5%",
        sub: "vs last month",
        color: "text-pink-500",
        bg: "bg-pink-50",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
            </svg>
        ),
    },
    {
        title: "Total Dividends",
        value: "$3,200",
        change: "+8%",
        sub: "all time",
        color: "text-green-500",
        bg: "bg-green-50",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
    },
    {
        title: "Next Due",
        value: "$500",
        sub: "Due in 3 days",
        subColor: "text-orange-500",
        bg: "bg-orange-50",
        border: "border-orange-400",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
];

const chitData = [
    {
        name: "Gold Scheme A",
        start: "Starts Jan 2023",
        progress: "10/20",
        percent: 50,
        barColor: "bg-yellow-400",
        nextDue: "$500",
        dueNote: "Due in 3 days",
        dueColor: "text-red-500",
        urgent: true,
    },
    {
        name: "Silver Scheme B",
        start: "Starts Mar 2023",
        progress: "8/24",
        percent: 33,
        barColor: "bg-purple-400",
        nextDue: "$300",
        dueNote: "Due Nov 5",
        dueColor: "text-gray-500",
        urgent: false,
    },
    {
        name: "Bronze Scheme C",
        start: "Starts Jun 2023",
        progress: "4/12",
        percent: 33,
        barColor: "bg-yellow-600",
        nextDue: "$200",
        dueNote: "Due Nov 12",
        dueColor: "text-gray-500",
        urgent: false,
    },
];

const recentActivity = [
    {
        title: "Payment Successful",
        sub: "Silver Scheme B - Installment #8",
        time: "2 hours ago",
        icon: (
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                </svg>
            </div>
        ),
    },
    {
        title: "Auction Results",
        sub: "Member #42 won Gold Scheme A",
        time: "Yesterday",
        icon: (
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 3l7 7" /><path d="M13 3l7 7" /><path d="M10 10l4 4" /><path d="M3 21l9-9" />
                </svg>
            </div>
        ),
    },
    {
        title: "New Chit Available",
        sub: "Diamond Plan - Starting Next Month",
        time: "Oct 22, 2023",
        icon: (
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            </div>
        ),
    },
];








function Icon({ name, className = "w-5 h-5" }) {
    const icons = {
        grid: (
            <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
        list: (
            <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
        ),
        "credit-card": (
            <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
        user: (
            <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        settings: (
            <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
        logout: (
            <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H9" />
            </svg>
        ),
        notebook: (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>)
    };
    return icons[name] || null;
}

export default function ChitFundDashboard() {
    const [activeNav, setActiveNav] = useState("Dashboard");
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");

    };



    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-44 bg-white flex flex-col py-5 px-3 border-r border-gray-100 shrink-0">
                {/* Logo */}
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

                {/* Nav */}
                <nav className="flex flex-col gap-1 flex-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => item.action === "logout" ? handleLogout() : (setActiveNav(item.label), navigate(item.path))}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeNav === item.label
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                        >
                            <Icon name={item.icon} className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User */}

                <div className="flex items-center gap-2 px-2 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user?.fullName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-gray-800 truncate">{user?.fullName}</div>
                        <div className="text-[10px] text-gray-400 truncate">{user?.role}</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(" ")[0]}</h1>
                            <p className="text-sm text-gray-400 mt-0.5">Today is {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                        <button
                            onClick={() => navigate("/user/customer/dashboard/")}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            Join New Chit
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {statsCards.map((card, i) => (
                            <div
                                key={i}
                                className={`bg-white rounded-xl p-4 border ${card.border ? `border-${card.border}` : "border-gray-100"} shadow-sm`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-gray-500 font-medium">{card.title}</span>
                                    <div className={`w-8 h-8 rounded-full ${card.bg} flex items-center justify-center`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-gray-900">{card.value}</div>
                                <div className="flex items-center gap-1 mt-1">
                                    {card.change && (
                                        <span className="text-xs text-green-500 font-medium flex items-center gap-0.5">
                                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                <polyline points="18 15 12 9 6 15" />
                                            </svg>
                                            {card.change}
                                        </span>
                                    )}
                                    <span className={`text-xs ${card.subColor || "text-gray-400"}`}>{card.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Active Chits Table */}
                        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-800">Your Active Chits</h2>
                                <button className="text-xs text-blue-500 hover:text-blue-700 font-medium">View All</button>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[11px] text-gray-400 uppercase tracking-wide">
                                        <th className="text-left px-5 py-3 font-medium">Chit Group</th>
                                        <th className="text-left px-3 py-3 font-medium">Progress</th>
                                        <th className="text-left px-3 py-3 font-medium">Next Due</th>
                                        <th className="text-left px-3 py-3 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chitData.map((chit, i) => (
                                        <tr key={i} className="border-t border-gray-50">
                                            <td className="px-5 py-3.5">
                                                <div className="text-sm font-semibold text-gray-800">{chit.name}</div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">{chit.start}</div>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <div className="text-xs text-gray-500 mb-1.5">
                                                    {chit.progress} &nbsp;
                                                    <span className="text-gray-400">{chit.percent}%</span>
                                                </div>
                                                <div className="w-28 bg-gray-100 rounded-full h-1.5">
                                                    <div
                                                        className={`${chit.barColor} h-1.5 rounded-full`}
                                                        style={{ width: `${chit.percent}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <div className="text-sm font-semibold text-gray-800">{chit.nextDue}</div>
                                                <div className={`text-[11px] mt-0.5 ${chit.dueColor}`}>{chit.dueNote}</div>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                {chit.urgent ? (
                                                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                                                        Pay Now
                                                    </button>
                                                ) : (
                                                    <button className="border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                                                        Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Right Panel */}
                        <div className="flex flex-col gap-4">
                            {/* Urgent Payment Card */}
                            <div className="bg-blue-600 rounded-xl p-4 text-white relative overflow-hidden">
                                <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Urgent
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-xs text-blue-200 mb-0.5">Upcoming Payment</div>
                                <div className="text-sm font-semibold mb-1">Gold Scheme A</div>
                                <div className="text-3xl font-bold mb-4">$500.00</div>
                                <button className="w-full bg-white text-blue-600 text-sm font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors" onClick={() => navigate("/payment")}>
                                    Make Payment Now
                                </button>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-1">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Activity</h3>
                                <div className="flex flex-col gap-3">
                                    {recentActivity.map((act, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                            {act.icon}
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold text-gray-800">{act.title}</div>
                                                <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">{act.sub}</div>
                                                <div className="text-[10px] text-gray-400 mt-1">{act.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-100 mt-2">
                    © 2023 ChitFund Pro. All rights reserved.
                </div>
            </main>
        </div>
    );
}