// src/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { dashboardApi } from "../api/dashboardApi";
import Sidebar from "../components/Sidebar";
import CollectPayment from "../payment/Payment";
import RecordCollectionForm from "./RecordCollectionForm";
import { customerApi } from "../api/customerApi";





const sidebarItems = [
  { label: "Dashboard", icon: "grid", path: "/admin/dashboard" },
  { label: "Customers", icon: "users", path: "/admin/dashboard/customers" },
  { label: "Chits", icon: "notebook", path: "/admin/dashboard/chits" },
  { label: "Collc-Tracker", icon: "credit-card", path: "/admin/dashboard/CollectionTracker" },
  { label: "Payment", icon: "credit-card", path: "/user/dashboard/collections/payment/{id}" },
  { label: "Logout", icon: "logout", action: "logout" },
];



const sidebarItems1 = [
  { label: "Dashboard", icon: "grid", path: "/dashboard" },
  { label: "Customers", icon: "users", path: "/agent/dashboard/customers" },
  { label: "Chits", icon: "list", path: "/agent/dashboard/chits" },
  { label: "Payments", icon: "credit-card", path: "/agent/dashboard/payment" },
  { label: "Enrollment", icon: "list", path: "/agent/dashboard/enrollment" },
  { label: "Settings", icon: "settings", path: "/settings" },
  { label: "Logout", icon: "logout", action: "logout" },
];


const sidebarItems2 = [
  { label: "Dashboard", icon: "grid", path: "user/dashboard" },
  { label: "Chits", icon: "notebook", path: "/user/dashboard/profile" },
  { label: "Payments", icon: "credit-card", path: "/user/dashboard/payment" },
  { label: "Logout", icon: "logout", action: "logout" },

];

function Icon({ name, className = "w-5 h-5" }) {
  const icons = {
    grid: (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>),
    list: (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>),
    "credit-card": (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>),
    users: (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
    settings: (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>),
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

const fmt = (v) => {
  if (v == null) return "₹0";
  return "₹" + Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function Skeleton({ className = "h-6 w-24" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function ChitFundDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);

  const chitData = [
    { name: "Gold Scheme A", start: "Started Jan 2026", progress: "5 / 20 mos", percent: 25, barColor: "bg-blue-500", nextDue: "₹5,000", dueNote: "Due in 3 days", dueColor: "text-orange-500", urgent: true },
    { name: "Mega Chit Group 5", start: "Started Mar 2025", progress: "14 / 30 mos", percent: 46, barColor: "bg-indigo-500", nextDue: "₹10,000", dueNote: "Paid", dueColor: "text-green-500", urgent: false },
  ];

  //logout
  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");

  };


  useEffect(() => {
    if (isAdmin) {
      dashboardApi.getReport()
        .then(setData)
        .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    customerApi.getAll(0, 1000)
      .then((res) => {
        setCustomers(res.content || []);
      });
  }, []);


  const fmtCount = (v) => {
    if (v == null) return "0";
    return Number(v).toLocaleString("en-IN");
  };

  const totalActiveChits = customers.reduce(
    (sum, c) => sum + (c.activeChits || 0),
    0
  );



  const statsCards = [
    {
      title: "Total Collected",
      value: loading ? null : fmt(data?.totalCollected),
      sub: `${data?.totalPayments ?? 0} payments`,
      color: "text-blue-500",
      bg: "bg-blue-50",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>),
    },
    {
      title: "Total Pending",
      value: loading ? null : fmt(data?.totalPending),
      sub: "outstanding",
      color: "text-pink-500",
      bg: "bg-pink-50",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>),
    },
    {
      title: "Total Customers",
      value: loading ? null : (customers?.length),
      sub: "Total active chits",
      color: "text-green-500",
      bg: "bg-green-50",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>),
    },

    {
      title: "Overdue Entries",
      value: loading ? null : String(data?.overdueEntries ?? 0),
      sub: "need attention",
      subColor: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
    },


  ];

  const statsCards1 = [
    {
      title: "Total Chits",
      value: loading ? null : fmt(data?.totalCollected),
      sub: `${data?.totalPayments ?? 0} payments`,
      color: "text-blue-500",
      bg: "bg-blue-50",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>),
    },


    {
      title: "Total Pending",
      value: loading ? null : fmt(data?.totalPending),
      sub: "outstanding",
      color: "text-pink-500",
      bg: "bg-pink-50",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>),
    },
    {
      title: "Overdue Entries",
      value: loading ? null : String(data?.overdueEntries ?? 0),
      sub: "need attention",
      subColor: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
    },
  ]

  const recentPayments = data?.recentPayments ?? [];
  const overdueCollections = data?.overdueCollections ?? [];

  const ROLE_CONFIG = {
    ADMIN: {
      sidebar: sidebarItems,
      stats: statsCards
    },
    AGENT: {
      sidebar: sidebarItems1,
      stats: statsCards
    },
    USER: {
      sidebar: sidebarItems2,
      stats: statsCards1
    }
  };




  const getMenuItems = () => {
    return ROLE_CONFIG[user?.role]?.sidebar || [];
  };

  const getStatsCards = () => {
    return ROLE_CONFIG[user?.role]?.stats || [];
  };

  return (

    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden"
    >
      {/* Sidebar */}
      < aside className="w-44 bg-white flex flex-col py-5 px-3 border-r border-gray-100 shrink-0" >
        <div className="flex items-center gap-2 px-2 mb-9">
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

        <nav className="flex flex-col gap-1 flex-1">
          {getMenuItems().map((item) => (
            <button
              key={item.label}
              onClick={() => item.action === "logout" ? handleLogout() : (setActiveNav(item.label), navigate(item.path))}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeNav === item.label ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
            >
              <Icon name={item.icon} className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 px-2 pt-4 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.fullName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-gray-800 truncate">{user?.fullName}</div>
            <div className="text-[10px] text-gray-400 truncate">{user?.role}</div>
          </div>

          <button onClick={handleLogout} title="Logout" className="text-gray-300 hover:text-red-400 transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      < main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(" ")[0]}</h1>
              <p className="text-sm text-gray-400 mt-0.5">Today is {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>


            <div className="flex gap-2">
              {user?.role === "ADMIN" ? (
                <button
                  onClick={() => navigate("/admin/dashboard/customers")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                  Manage Customers
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/${user?.role.toLowerCase()}/dashboard/chits`)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                  Join New Chit
                </button>

              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}



          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {getStatsCards().map((card, i) => (
              <div key={i} className={`bg-white rounded-xl p-4 border ${card.border || "border-gray-100"} shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 font-medium">{card.title}</span>
                  <div className={`w-8 h-8 rounded-full ${card.bg} flex items-center justify-center`}>{card.icon}</div>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {card.value == null ? <Skeleton className="h-7 w-28" /> : card.value}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs ${card.subColor || "text-gray-400"}`}>{card.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Section Layout */}
          {isAdmin ? (

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <h2 className="text-sm font-semibold text-gray-800">Recent Payments</h2>
                  <button onClick={() => navigate("/admin/dashboard/customers")} className="text-xs text-blue-500 hover:text-blue-700 font-medium">View All</button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-[11px] text-gray-400 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-medium">Receipt / Customer</th>
                      <th className="text-left px-3 py-3 font-medium">Plan</th>
                      <th className="text-left px-3 py-3 font-medium">Amount</th>
                      <th className="text-left px-3 py-3 font-medium">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-5 py-3.5"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-3 py-3.5"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-3 py-3.5"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-3 py-3.5"><Skeleton className="h-4 w-12" /></td>
                        </tr>
                      ))
                    ) : recentPayments.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">No recent payments found.</td></tr>
                    ) : (
                      recentPayments.map((p, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-5 py-3.5">

                            <div className="text-sm font-semibold text-gray-800">{p.customerName || "Not Mapped Customer"}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{p.receiptNumber}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{p.customerPhone}</div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="text-sm text-gray-600">{p.chitPlanName}</div>
                            <div className="text-[11px] text-gray-400">Month #{p.monthNumber}</div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="text-sm font-semibold text-green-600">{fmt(p.amountPaid)}</div>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="text-xs bg-green-700 text-gray-100 px-2 py-0.5 rounded-full font-medium">
                              {p.paymentMode || "CASH"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>



              <div className="flex flex-col gap-4">
                <div className="bg-blue-600 rounded-xl p-4 text-white relative overflow-hidden">
                  <div className="text-xs text-blue-200 mb-0.5">Monthly Collection</div>
                  <div className="text-3xl font-bold mb-1">
                    {loading ? <Skeleton className="h-9 w-32 bg-blue-400" /> : fmt(data?.monthlyCollection)}
                  </div>
                  <div className="text-xs text-blue-300 mb-4">{data?.totalCustomers ?? 0} active customers</div>
                  <button onClick={() => navigate("/payment")} className="w-full bg-white text-blue-600 text-sm font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors">
                    Record Payment
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    Overdue Collections
                    {data?.overdueEntries > 0 && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{data.overdueEntries}</span>
                    )}
                  </h3>



                  <div className="flex flex-col gap-2">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3"><Skeleton className="h-3 w-full mb-1" /><Skeleton className="h-3 w-2/3" /></div>
                      ))
                    ) : overdueCollections.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No overdue collections 🎉</p>
                    ) : (
                      overdueCollections.slice(0, 4).map((o, i) => (
                        <div key={i} className="flex items-start gap-3 bg-red-50 rounded-lg p-3">
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                          </div>
                          <div className="min-w-0">

                            <div className="text-xs font-semibold text-gray-800">{o.customerName || "Not Mapped Customer"}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{o.chitPlanName} – Month {o.monthNumber}</div>
                            <div className="text-[11px] text-red-600 font-semibold mt-0.5">{fmt(o.balanceAmount)} due</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (

            <div className="grid grid-cols-3 gap-4">
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
                            <button onClick={() => navigate("/agent/dashboard/payment")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
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

              <div className="flex flex-col gap-4">
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
                  <div className="text-3xl font-bold mb-4">₹5,000.00</div>
                  <button className="w-full bg-white text-blue-600 text-sm font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors" onClick={() => navigate("/payment")}>
                    Make Payment Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-100 mt-2">
          © {new Date().getFullYear()} ChitFund Pro. All rights reserved.
        </div>
      </main>
    </div >
  );
}
