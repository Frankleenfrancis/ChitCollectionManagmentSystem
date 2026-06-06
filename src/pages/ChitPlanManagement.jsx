import { useState, useEffect, useRef } from "react";
import { chitPlanApi } from "../api/chitPlanApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EditChitPlan from "../components/EditChitPlan";
import { useAuth } from "../components/AuthContext";



function PlanStatusBadge({ status }) {
    let styles = "bg-green-50 text-green-600";
    let dotStyles = "bg-green-500";

    if (status === "Upcoming") {
        styles = "bg-blue-50 text-blue-600";
        dotStyles = "bg-blue-500";
    } else if (status === "Completed" || status === "Inactive") {
        styles = "bg-gray-50 text-gray-600";
        dotStyles = "bg-gray-500";
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`}></span>
            {status}
        </span>
    );
}


function DurationProgressBar({ value }) {
    const color =
        value >= 80
            ? "bg-emerald-500"
            : value >= 40
                ? "bg-indigo-500"
                : "bg-amber-500";

    return (
        <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                ></div>
            </div>
            <span className="text-xs text-gray-400">
                {value}% Term Completed
            </span>
        </div>
    );
}

function ActionMenu({ isOpen, onToggle, onEdit, onDelete }) {
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                onToggle();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onToggle]);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="4" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="10" cy="16" r="1.5" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a3 3 0 01-3 3H9a3 3 0 01-3-3V7m12 0H6" />
                        </svg>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}


const planInitials = (title) =>
    title?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "CP";

export default function ChitPlanManagement() {


    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");


    const [durationFilter, setDurationFilter] = useState("All Durations");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [page, setPage] = useState(1);
    const [activeMenuId, setActiveMenuId] = useState(null);

    const navigate = useNavigate();

    const { user } = useAuth();
    const userRole = user?.role?.toUpperCase();
    const isAdmin = userRole === "ADMIN";


    const totalPlansCount = totalElements || plans.length || 0;

    const activeChitsValue = plans
        .filter(p => p.status === "Active" || !p.status)
        .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const highValueCount = plans.filter(p => (p.totalAmount || 0) >= 100000).length;


    const handleHomeRedirect = () => {
        if (location.pathname.includes("/admin")) {
            navigate("/admin/dashboard");
        } else if (location.pathname.includes("/agent")) {
            navigate("/agent/dashboard");
        } else {
            navigate("/login");
        }
    };

    const stats = [
        {
            label: "Total Chit Schemes",
            value: totalPlansCount,
            color: "text-indigo-600"
        },
        {
            label: "Active Pool Value",
            value: `₹${activeChitsValue.toLocaleString('en-IN')}`,
            color: "text-emerald-600"
        },
        {
            label: "Premium Schemes (≥1L)",
            value: highValueCount,
            color: "text-amber-500"
        },
        {
            label: "Page Framework",
            value: plans.length === 0 ? "0" : `${page} / ${totalPages || 1}`,
            color: "text-purple-600"
        }
    ];


    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const loadChitPlans = async () => {
        try {
            setLoading(true);
            const data = await chitPlanApi.getAll(
                page - 1,
                10,
                "createdAt",
                "desc"
            );

            if (Array.isArray(data)) {
                setPlans(data);
                setTotalElements(data.length);
            } else if (data?.content) {
                setPlans(data.content);
                setTotalElements(data.totalElements || data.content.length);
                setTotalPages(data.totalPages || 1);
            } else {
                setPlans([]);
            }
        } catch (error) {
            console.error("Failed to load chit plans:", error);
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChitPlans();
    }, [page]);


    const handleAddClick = () => {
        if (userRole === "ADMIN") {
            navigate("/admin/dashboard/chits/create");
        } else if (userRole === "AGENT") {
            navigate("/agent/dashboard/chits/create");
        }
    };

    const handleEditClick = (plan) => {
        console.log("Plan payload clicked:", plan);
        const targetId = plan.id || plan.planCode || plan.schemeCode;

        if (!targetId) {
            toast.error("Error: Missing plan registration schema code or ID.");
            return;
        }

        setActiveMenuId(null);


        if (userRole === "ADMIN") {
            navigate(`/admin/dashboard/chits/edit/${targetId}`, {
                state: { planData: plan }
            });
        } else {
            navigate(`/agent/dashboard/chits/edit/${targetId}`, {
                state: { planData: plan }
            });
        }
    };

    const handleDeleteClick = async (planRow) => {
        const searchCode = planRow.planCode || planRow.id;

        if (!searchCode) {
            toast.error("Unable to delete: Missing internal tracking code reference.");
            return;
        }

        if (!window.confirm(`Are you sure you want to permanently delete plan scheme ${planRow.planName}?`)) {
            return;
        }

        const cleanNumericString = String(searchCode).replace(/\D/g, "");
        const databaseId = parseInt(cleanNumericString, 10);

        if (isNaN(databaseId)) {
            toast.error("Invalid structural identification format.");
            return;
        }

        try {
            toast.loading("Processing scheme termination...", { id: "delete-toast" });
            await chitPlanApi.deactivate(databaseId);
            toast.success("Chit Plan dropped successfully!", { id: "delete-toast" });

            setPlans((prevPlans) =>
                prevPlans.filter(p => (p.planCode || p.id) !== searchCode)
            );
        } catch (err) {
            console.error("Deletion lifecycle crash:", err);
            const serverMessage = err.response?.data?.message || "Failed to alter records database storage configuration.";
            toast.error(serverMessage, { id: "delete-toast" });
        }
    };


    const filtered = plans.filter((p) => {
        const matchSearch =
            p.planName?.toLowerCase().includes(search.toLowerCase()) ||
            String(p.planCode || p.id).toLowerCase().includes(search.toLowerCase());

        const matchDuration =
            durationFilter === "All Durations" ||
            String(p.durationMonths) === durationFilter.replace(" Months", "");

        const matchStatus =
            statusFilter === "All Statuses" ||
            p.status === statusFilter;

        const matchType =
            typeFilter === "All Types" ||
            p.planType === typeFilter;

        return matchSearch && matchDuration && matchStatus && matchType;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-6">
            <div className="max-w-6xl mx-auto space-y-6">


                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">

                        <button
                            type="button"
                            onClick={() => {
                                if (window.location.pathname.includes("/admin")) {
                                    navigate("/admin/dashboard");
                                } else if (window.location.pathname.includes("/agent")) {
                                    navigate("/agent/dashboard");
                                } else {
                                    navigate("/login");
                                }
                            }}
                            className="mt-1 flex items-center justify-center p-2.5 border border-gray-200 bg-white hover:bg-gray-50 hover:text-indigo-600 text-gray-500 rounded-xl shadow-sm transition-colors"
                            title="Go to Dashboard Home"
                        >
                            <span className="text-base leading-none">⬅️</span>
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chit Schema Plan
                            </h1>
                            <p className="text-sm text-gray-400 mt-0.5">
                                Configure dynamic amounts, installment schedules, and systematic terms.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 items-center">
                        <button onClick={handleAddClick}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors">
                            <span className="text-lg leading-none">+</span>
                            Create New Plan
                        </button>

                    </div>
                </div>



                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Search Plan Profile
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Plan Name or Scheme Code..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
                                />
                            </div>
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Duration Cycle
                            </label>
                            <select
                                value={durationFilter}
                                onChange={(e) => setDurationFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white appearance-none cursor-pointer"
                            >
                                <option>All Durations</option>
                                <option>12 Months</option>
                                <option>18 Months</option>
                                <option>24 Months</option>
                                <option>36 Months</option>

                            </select>
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Lifecycle Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white appearance-none cursor-pointer"
                            >
                                <option>All Statuses</option>
                                <option>Active</option>
                                <option>Upcoming</option>
                                <option>Completed</option>
                            </select>
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Scheme Tier Type
                            </label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white appearance-none cursor-pointer"
                            >
                                <option>All Types</option>
                                <option>Regular</option>
                                <option>Premium</option>
                                <option>Festival Special</option>
                            </select>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Chit Scheme Profile Name & Code
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Scheme Category
                                    </th>
                                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Total Chit Value
                                    </th>
                                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Monthly Premium Installment
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Cycle Progress
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Status
                                    </th>

                                    {isAdmin && (
                                        <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                            Actions
                                        </th>
                                    )}

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                                            Loading configured scheme settings plans data array models...
                                        </td>
                                    </tr>
                                ) : filtered.length > 0 ? (
                                    filtered.map((p, idx) => {

                                        const progressPercentage =
                                            p.durationMonths && p.currentMonthRun
                                                ? Math.round((p.currentMonthRun / p.durationMonths) * 100)
                                                : 0;

                                        const rowId = p.planCode || p.id || `plan-row-${idx}`;

                                        return (
                                            <tr key={rowId} className="hover:bg-gray-50/70 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-indigo-600 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                            {planInitials(p.planName)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {p.planName}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                Code: {p.planCode || p.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>


                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {p.planType || "Regular"} ({p.durationMonths} Months)
                                                </td>

                                                {/* Total Chit Value Mapping */}
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">
                                                    ₹{(p.totalAmount || 0).toLocaleString('en-IN')}
                                                </td>


                                                <td className="px-6 py-4 text-sm font-semibold text-indigo-600 text-right">
                                                    ₹{(p.monthlyAmount || 0).toLocaleString('en-IN')}
                                                </td>


                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <DurationProgressBar value={progressPercentage || p.hardcodedProgress || 0} />
                                                        <span className="text-[10px] text-gray-400">Max Members: {p.maxMembers || 0}</span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <PlanStatusBadge status={p.status || "Active"} />
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    {isAdmin && (
                                                        <ActionMenu
                                                            isOpen={activeMenuId === rowId}
                                                            onToggle={() => setActiveMenuId(activeMenuId === rowId ? null : rowId)}
                                                            onEdit={() => handleEditClick(p)}
                                                            onDelete={() => handleDeleteClick(p)}
                                                        />
                                                    )}
                                                </td>

                                            </tr>

                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                                            No active chit plans matched the applied criteria selectors.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>


                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                        <p className="text-sm text-gray-400">
                            Showing {filtered.length} plans
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                Previous
                            </button>

                            {[1, 2, 3].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${page === p
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <span className="px-1 text-gray-400 text-sm">...</span>

                            <button
                                onClick={() => setPage((prev) => prev + 1)}
                                className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all duration-200 hover:shadow-md">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {s.label}
                            </p>
                            <p className={`text-2xl font-bold mt-2 tracking-tight ${s.color}`}>
                                {s.value}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}