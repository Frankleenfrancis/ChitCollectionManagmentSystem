
import { use, useEffect, useMemo, useState } from "react";
import { customerApi } from "../api/customerApi";
import { chitPlanApi } from "../api/chitPlanApi";
import { chitCollectionApi } from "../api/chitCollectionApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

import {
    Search,
    Plus,
    Pencil,
    Eye,
    X,
    Users,
    BadgeIndianRupee,
    Layers3,
} from "lucide-react";


export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [plans, setPlans] = useState([]);
    const [saving, setSaving] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const { user, } = useAuth();
    const role = user?.role;
    const userId = user?.id;

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        phone: "",
        email: "",
        password: "",
        address: "",
        city: "",
        role: "CUSTOMER",
        active: true,

    });


    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState("");

    const navigate = useNavigate();

    const initials = (name) =>
        name
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "??";


    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const loadCustomers = async () => {
        try {
            setLoading(true);

            let data;

            if (debouncedSearch.trim()) {
                data = await customerApi.search(
                    debouncedSearch,
                    page,
                    10
                );
            } else {
                data = await customerApi.getAll(
                    page,
                    10,
                    "createdAt",
                    "desc"
                );
            }
            console.log("API Response received:", data);
            console.log("Content length:", data.data?.content?.length);

            setCustomers(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, [page, debouncedSearch]);

    const handleCreateUser = async (customer) => {
        try {
            const payload = {
                fullName: customer.fullName,
                username: customer.username,
                fullName: customer.phone,
                password: customer.password,
                email: customer.email,
                phone: customer.phone,
                role: "USER",
            };

            await customerApi.createUserForCustomer(customer.id, payload);

            alert("User created for Customer successfully");
        } catch (error) {
            console.error(error);

            alert(
                error?.response?.data?.message ||
                "Failed to create user"
            );
        }
    };

    const filteredCustomers = useMemo(() => {
        const keyword = search.toLowerCase();

        let list = customers;

        if (role === "CUSTOMER") {
            list = customers.filter(c => c.id == userId);
        }

        return list.filter((c) =>
            (c.fullName || "").toLowerCase().includes(keyword) ||
            (c.username || "").toLowerCase().includes(keyword) ||
            (c.email || "").toLowerCase().includes(keyword) ||
            (c.phone || "").toLowerCase().includes(keyword) ||
            (c.city || "").toLowerCase().includes(keyword)
        );
    }, [customers, search, role, userId]);

    //formulas
    const totalActiveChits = customers.reduce(
        (sum, customer) => sum + (customer.activeChits || 0),
        0
    );

    const totalAmountPaid = customers.reduce(
        (sum, customer) => sum + (customer.amountPaid || 0), 0
    )

    const totalPendingAmount = customers.reduce(
        (sum, customer) =>
            sum + ((customer.totalAmount || 0) - (customer.amountPaid || 0)),
        0
    );

    const fmt = (v, isCurrency = true) => {
        if (v == null) return isCurrency ? "₹0.00" : "0";

        const formatted = Number(v).toLocaleString("en-IN", {
            minimumFractionDigits: isCurrency ? 2 : 0,
            maximumFractionDigits: isCurrency ? 2 : 0,
        });

        return isCurrency ? `₹${formatted}` : formatted;
    };

    const fmtCount = (v) => {
        if (v == null) return "0";
        return Number(v).toLocaleString("en-IN");
    };

    function Skeleton({ className = "h-6 w-24" }) {
        return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
    }


    const loadPlans = async () => {
        try {
            const response = await chitPlanApi.getAll();

            if (Array.isArray(response)) {
                setPlans(response);
            } else if (Array.isArray(response?.content)) {
                setPlans(response.content);
            } else if (Array.isArray(response?.data)) {
                setPlans(response.data);
            } else {
                setPlans([]);
            }
        } catch (err) {
            console.error(err);
            setPlans([]);
        }
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const resetForm = () => {
        setForm({
            fullName: "",
            username: "",
            phone: "",
            email: "",
            password: "",
            address: "",
            city: "",
            active: true,
        });

        setEditingId(null);
        setViewMode(false);
    };

    const openCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (c) => {
        setForm(c);
        setEditingId(c.id);
        setViewMode(false);
        setShowModal(true);
    };

    const openView = (c) => {
        setForm(c);
        setViewMode(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            if (editingId) {
                await customerApi.update(
                    editingId,
                    form
                );
            } else {
                await customerApi.create(form);
            }

            await loadCustomers();

            setShowModal(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleEnroll = async () => {
        if (!selectedCustomer || !selectedPlan) return;

        try {
            const payload = {
                customerId: selectedCustomer.id,
                chitPlanId: selectedPlan,
            };

            await chitCollectionApi.enrollCustomer(payload);

            alert("Customer enrolled successfully")

            setSelectedCustomer(null);
            setSelectedPlan("");
        } catch (error) {
            console.error(error);
        }
    };

    const statsCards = [
        {
            title: "Total Customers",
            value: loading ? null : (customers?.length),
            sub: "Count of total customers",
            color: "text-blue-500",
            bg: "bg-blue-50",
            icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>),
        },
        {
            title: "Total Pending",
            value: loading ? null : fmt(totalPendingAmount),
            sub: "outstanding",
            color: "text-pink-500",
            bg: "bg-pink-50",
            icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>),
        },

        {
            title: "Total paid",
            value: loading ? null : fmt(customers?.totalAmountPaid),
            sub: "outstanding",
            color: "text-pink-500",
            bg: "bg-pink-50",
            icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>),
        },
        {
            title: "Active Chits",
            value: loading ? null : fmtCount(totalActiveChits),
            sub: "Total active chits",
            color: "text-green-500",
            bg: "bg-green-50",
            icon: (<svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>),
        },



    ];


    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start justify-between">
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
                        <h1 className="text-3xl font-bold text-gray-900 px-4">
                            Customer Management
                            <span>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    Manage customers, enrollments, collections and payments.
                                </p>
                            </span>
                        </h1>

                    </div>
                    {role == "ADMIN" && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl hover:opacity-90 transition"
                        >
                            <Plus size={18} />
                            Create Customer
                        </button>
                    )}
                </div>
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {statsCards.map((card, i) => (
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


                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="relative w-full lg:w-96">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search customer..."
                                className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">Customer & ID</th>
                                    <th className="px-6 py-4 text-left">Phone</th>
                                    <th className="px-6 py-4 text-left">Active Chits</th>
                                    <th className="px-6 py-4 text-left">Paid</th>
                                    <th className="px-6 py-4 text-left">Pending</th>
                                    <th className="px-6 py-4 text-left">Chit Group</th>
                                    <th className="px-6 py-4 text-left">Total Value</th>
                                    <th className="px-6 py-4 text-left">Amount Paid</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Enroll</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="11" className="text-center py-10 text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="text-center py-10 text-gray-500">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((c) => (
                                        <tr
                                            key={c.id}
                                            className="border-t border-gray-100 hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                                                        {initials(c.fullName)}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">
                                                            {c.fullName}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            #Id :{c.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-gray-700">
                                                {c.phone}
                                            </td>


                                            <td className="px-6 py-4">
                                                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                                                    {c.activeChits}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">₹ {c.totalPaid}</td>

                                            <td className="px-4 py-4">
                                                ₹ {(c.totalPending || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-6 py-4">
                                                {c.chitGroupName || "-"}
                                            </td>

                                            <td className="px-6 py-4">
                                                ₹ {(c.totalValue || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-6 py-4">
                                                ₹ {(c.amountPaid || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td>
                                                <span
                                                    className={`px-8 py-1 rounded-full text-xs font-semibold ${c.active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {c.active ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedCustomer(c)}
                                                        className="px-3 py-2 rounded-xl bg-black text-white text-sm"
                                                    >
                                                        Enroll
                                                    </button>

                                                </div>
                                            </td>
                                            <td className="px-6 py-4 relative">
                                                <button
                                                    onClick={() =>
                                                        setOpenMenu(openMenu === c.id ? null : c.id)
                                                    }
                                                    className="p-2 rounded-lg hover:bg-gray-100"
                                                >
                                                    ⋮
                                                </button>

                                                {openMenu === c.id && (
                                                    <div className="absolute right-4 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50">
                                                        <button
                                                            onClick={() => {
                                                                openView(c);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                        >
                                                            👁 View
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                openEdit(c);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                        >
                                                            ✏️ Edit
                                                        </button>


                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage((prev) => prev - 1)}
                            className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <p className="text-sm text-gray-500">
                            Page {page + 1} of {totalPages}
                        </p>

                        <button
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                            className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {viewMode
                                        ? "View Customer"
                                        : editingId
                                            ? "Edit Customer"
                                            : "Create Customer"}
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Manage customer information.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        disabled={viewMode}
                                        value={form.fullName}
                                        onChange={(e) =>
                                            setForm({ ...form, fullName: e.target.value })
                                        }
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        username
                                    </label>

                                    <input
                                        type="text"
                                        disabled={viewMode}
                                        value={form.username}
                                        onChange={(e) =>
                                            setForm({ ...form, username: e.target.value })
                                        }
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        disabled={viewMode}
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm({ ...form, phone: e.target.value })
                                        }
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        disabled={viewMode}
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        disabled={viewMode}
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        disabled={viewMode}
                                        value={form.city}
                                        onChange={(e) =>
                                            setForm({ ...form, city: e.target.value })
                                        }
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    ROLE
                                </label>

                                <select
                                    disabled={viewMode}
                                    value={form.role}
                                    onChange={(e) =>
                                        setForm({ ...form, role: e.target.value })
                                    }
                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="">Select Role</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="AGENT">AGENT</option>
                                    <option value="CUSTOMER">CUSTOMER</option>
                                    <option value="USER">USER</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    Address
                                </label>

                                <textarea
                                    rows="4"
                                    disabled={viewMode}
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm({ ...form, address: e.target.value })
                                    }
                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            {!viewMode && (
                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-3 rounded-2xl border border-gray-200"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-5 py-3 rounded-2xl bg-black text-white disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingId
                                                ? "Update Customer"
                                                : "Create Customer"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div >

            )
            }

            {
                selectedCustomer && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Enroll Customer
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Assign chit plan to customer.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-2 rounded-xl hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <p className="font-semibold text-gray-900">
                                        {selectedCustomer.fullName}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedCustomer.phone}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Select Chit Plan
                                    </label>

                                    <select
                                        value={selectedPlan}
                                        onChange={(e) => setSelectedPlan(e.target.value)}
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value="">Choose Plan</option>

                                        {Array.isArray(plans) &&
                                            plans.map((plan) => (
                                                <option
                                                    key={plan.id}
                                                    value={plan.id}
                                                >
                                                    {plan.planName} - ₹ {plan.totalValue}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setSelectedCustomer(null)}
                                        className="px-5 py-3 rounded-2xl border border-gray-200"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleEnroll}
                                        className="px-5 py-3 rounded-2xl bg-black text-white"
                                    >
                                        Enroll Customer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}




