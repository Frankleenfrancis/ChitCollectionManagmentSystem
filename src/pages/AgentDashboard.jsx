import { useState, useEffect, useRef } from "react";
import { customerApi } from "../api/customerApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CreateCustomer from "./CreateCustomer";
import EditCustomer from "../components/EditCustomer";
import { useAuth } from "../components/AuthContext";

function StatusBadge({ status }) {
    const isOverdue = status?.startsWith("Overdue");

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOverdue
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
                }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${isOverdue ? "bg-red-500" : "bg-green-500"
                    }`}
            ></span>
            {status}
        </span>
    );
}

function ProgressBar({ value }) {
    const color =
        value >= 80
            ? "bg-green-500"
            : value >= 40
                ? "bg-indigo-500"
                : "bg-indigo-400";

    return (
        <div className="flex flex-col gap-1 min-w-[100px]">
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
            <span className="text-xs text-gray-400">
                {value}% Completed
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

const initials = (name) =>
    name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??";


export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1); // Added fallback to prevent undefined issues
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(""); // State added so the timeout can target it
    const [group, setGroup] = useState("All Groups");
    const [status, setStatus] = useState("All Statuses");
    const [area, setArea] = useState("All Areas");
    const [page, setPage] = useState(1);

    const [activeMenuId, setActiveMenuId] = useState(null);

    const navigate = useNavigate();

    const { user } = useAuth();
    const userRole = user?.role;

    // --- Dynamic Stats Calculations (Moved Inside Component Scope) ---
    const totalCustomersCount = totalElements || customers.length || 0;

    const uniqueCitiesCount = new Set(
        customers.map(c => c.city?.trim().toLowerCase()).filter(Boolean)
    ).size;

    const missingEmailCount = customers.filter(c => !c.email || c.email.trim() === "").length;

    const stats = [
        {
            label: "Total Customers",
            value: totalCustomersCount,
            color: "text-indigo-600"
        },
        {
            label: "Active Cities",
            value: uniqueCitiesCount,
            color: "text-emerald-600"
        },
        {
            label: "Missing Emails",
            value: missingEmailCount,
            color: "text-amber-500"
        },
        {
            label: "Current Page View",
            value: customers.length === 0 ? "0" : `${page} / ${totalPages || 1}`,
            color: "text-purple-600"
        }
    ];


    // --- Search Debounce Effect (Moved Inside Component Scope) ---
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await customerApi.getAll(
                page - 1,
                10,
                "createdAt",
                "desc"
            );

            if (Array.isArray(data)) {
                setCustomers(data);
                setTotalElements(data.length);
            } else if (data?.content) {
                setCustomers(data.content);
                setTotalElements(data.totalElements || data.content.length);
                setTotalPages(data.totalPages || 1);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error("Failed to load customers:", error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, [page]);





    const handleAddClick = () => {

        if (userRole === "ADMIN") {
            navigate("/admin/dashboard/customers/create-customer");

        } else if (userRole === "AGENT") {
            navigate("/agent/dashboard/customers/create-customer");

        } else {

            navigate("/dashboard/customers/create-customer");
        }
    };



    const handleEditClick = (customer) => {
        console.log("Customer payload clicked:", customer);

        // 1. Read the direct database id field from the response structure
        const databaseId = customer.id;

        // 2. Guard against missing or undefined IDs safely
        if (!databaseId) {
            toast.error("Error: Missing primary database customer ID.");
            console.error("The customer object does not contain a valid 'id' property:", customer);
            return;
        }

        console.log(`Successfully targeting path navigation value: ${databaseId}`);

        // 3. Reset active menu layouts if applicable
        if (typeof setActiveMenuId === "function") {
            setActiveMenuId(null);
        }

        // 4. Securely route using the clean ID
        navigate(`/admin/dashboard/edit-customer/${databaseId}`, {
            state: { customerData: customer }
        });
    };


    const handleDeleteClick = async (customerRow) => {
        const searchCode = customerRow.customerCode || customerRow.id;

        if (!searchCode) {
            toast.error("Unable to delete: Missing customer tracking reference code.");
            return;
        }

        if (!window.confirm(`Are you sure you want to permanently delete customer ${customerRow.fullName}?`)) {
            return;
        }

        const cleanNumericString = String(searchCode).replace(/\D/g, "");
        const databaseId = parseInt(cleanNumericString, 10);

        if (isNaN(databaseId)) {
            toast.error("Invalid identification code format. Cannot resolve database ID.");
            return;
        }

        try {
            toast.loading("Processing deletion...", { id: "delete-toast" });

            await customerApi.deactivate(databaseId);

            toast.success("Customer record removed successfully!", { id: "delete-toast" });

            setCustomers((prevCustomers) =>
                prevCustomers.filter(c => (c.customerCode || c.id) !== searchCode)
            );

        } catch (err) {
            console.error("Backend deletion failure:", err);
            const serverMessage = err.response?.data?.message || "Failed to delete customer from database.";
            toast.error(serverMessage, { id: "delete-toast" });
        }
    };


    const handleCollectPayment = (customer) => {
        // Navigate to the payment collection page, passing customer data via state
        navigate(`/dashboard/payments/collect/${customer.id}`, {
            state: {
                customer: customer,
                defaultAmount: customer.totalValue - customer.amountPaid // Pre-calculate remaining
            }
        });
    };


    const filtered = customers.filter((c) => {
        const matchSearch =
            c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            c.id?.toLowerCase().includes(search.toLowerCase());

        // FIXED: Changed c.groupName to c.chitGroupName
        const matchGroup =
            group === "All Groups" ||
            c.chitGroupName === group;

        const matchStatus =
            status === "All Statuses" ||
            c.status === status;

        return matchSearch && matchGroup && matchStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-6"
        >
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
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
                            className="mt-1  flex items-left justify-center p-2  m-2 border border-gray-200 bg-white hover:bg-gray-50 hover:text-indigo-600 text-gray-500 rounded-xl shadow-sm transition-colors"
                            title="Go to Dashboard Home"
                        >
                            <span className="text-base leading-none">⬅️</span>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Customer Management
                            <span>
                                <p className="text-sm text-gray-400  ">
                                    Manage and monitor chit fund participants across all active groups.
                                </p>
                            </span>
                        </h1>
                        {/* <div className="p-2">
                           
                            
                        </div> */}
                    </div>

                    <div className="flex gap-3">
                        {user?.role === "ADMIN" && (
                            <button
                                onClick={handleAddClick}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-2 py-2 rounded-xl shadow-sm transition-colors"
                            >
                                <span className="text-lg leading-none">+</span>
                                Add New Customer
                            </button>
                        )}
                        <button className="flex items-center gap-1 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-2 py-2 rounded-xl shadow-sm transition-colors">
                            Export CSV
                        </button>

                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Search Customer
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Name or ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
                                />
                            </div>
                        </div>

                        {/* Group */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Group
                            </label>
                            <select
                                value={group}
                                onChange={(e) => setGroup(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white appearance-none cursor-pointer"
                            >
                                <option>All Groups</option>
                                {[...new Set(customers.map((c) => c.chitGroupName))].filter(Boolean).map((g) => (
                                    <option key={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white appearance-none cursor-pointer"
                            >
                                <option>All Statuses</option>
                                <option>Up-to-date</option>
                                <option>Overdue</option>
                            </select>
                        </div>

                        {/* Area */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Area
                            </label>
                            <select
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white appearance-none cursor-pointer"
                            >
                                <option>All Areas</option>
                                <option>North</option>
                                <option>South</option>
                                <option>East</option>
                                <option>West</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* SINGLE Scroll wrapper for the entire table architecture */}
                    <div className="overflow-x-auto">
                        {/* Added 'table-fixed' and a minimum width to prevent columns from collapsing on small screens */}
                        <table className="w-full table-fixed min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    {/* Explicitly defining width percentages totals 100% */}
                                    <th className="w-[22%] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Customer Name & ID
                                    </th>
                                    <th className="w-[13%] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Chit Group
                                    </th>
                                    <th className="w-[15%] text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Total Value
                                    </th>
                                    <th className="w-[15%] text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Amount Paid
                                    </th>
                                    <th className="w-[15%] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Progress
                                    </th>
                                    <th className="w-[12%] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Status
                                    </th>
                                    <th className="w-[8%] text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                                            Loading customers...
                                        </td>
                                    </tr>
                                ) : filtered.length > 0 ? (
                                    filtered.map((c, idx) => {
                                        // 1. Direct field mappings from your CustomerResponse DTO
                                        const totalSchemeValue = c.totalValue !== undefined && c.totalValue !== null ? c.totalValue : 0;
                                        const totalAmountPaid = c.amountPaid !== undefined && c.amountPaid !== null ? c.amountPaid : 0;

                                        // 2. Safe calculation matching your percentage bar logic
                                        const progress = totalSchemeValue > 0
                                            ? Math.round((Number(totalAmountPaid) / Number(totalSchemeValue)) * 100)
                                            : 0;

                                        const rowId = c.customerCode || c.id || `row-${idx}`;

                                        return (
                                            <tr key={rowId} className="hover:bg-gray-50/70 transition-colors group">
                                                {/* Customer Name Column */}
                                                <td className="px-6 py-4 truncate">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-indigo-500 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                            {initials(c.fullName)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                                {c.fullName}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                ID: #{c.customerCode || c.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Chit Group Column */}
                                                <td className="px-6 py-4 text-sm text-gray-600 truncate">
                                                    {c.chitGroupName || "N/A"}
                                                </td>

                                                {/* Total Value Column */}
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800 text-right">
                                                    ₹{totalSchemeValue}
                                                </td>

                                                {/* Amount Paid Column */}
                                                <td className="px-6 py-4 text-sm font-semibold text-indigo-600 text-right">
                                                    ₹{totalAmountPaid}
                                                </td>

                                                {/* Progress Bar Column */}
                                                <td className="px-6 py-4">
                                                    <ProgressBar value={progress} />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <StatusBadge status={c.status || "Up-to-date"} />
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <ActionMenu
                                                        isOpen={activeMenuId === rowId}
                                                        onToggle={() => setActiveMenuId(activeMenuId === rowId ? null : rowId)}
                                                        onEdit={() => handleEditClick(c)}
                                                        onDelete={() => handleDeleteClick(c)}
                                                        onDelete={() => handleDeleteClick(c)}

                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                                            No customers found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-400">
                            Showing {filtered.length} customers
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

                {/* Stats Summary Banner Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all duration-200 hover:shadow-md">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {s.label}
                            </p>
                            <p className={`text-3xl font-bold mt-2 tracking-tight ${s.color}`}>
                                {s.value}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div >
    );
}