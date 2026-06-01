// src/pages/UserDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { customerApi } from "../api/customerApi";
import { useAuth } from "../components/AuthContext";
import { chitPlanApi } from "../api/chitPlanApi";


const initials = (name) =>
    name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??";

const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const isOverdue = status?.toLowerCase().startsWith("overdue");
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOverdue ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${isOverdue ? "bg-red-500" : "bg-green-500"
                    }`}
            />
            {status || "Up-to-date"}
        </span>
    );
}

function ProgressBar({ value, color = "bg-indigo-500" }) {
    return (
        <div className="space-y-1">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
            <p className="text-xs text-gray-400">{value}% completed</p>
        </div>
    );
}

// ─── Payment Modal ───────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
    { id: "UPI", label: "UPI", icon: "📲" },
    { id: "NEFT", label: "NEFT / IMPS", icon: "🏦" },
    { id: "CARD", label: "Card", icon: "💳" },
    { id: "CASH", label: "Cash", icon: "💵" },
];

function PaymentModal({ customer, onClose, onSuccess }) {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("UPI");
    const [upiId, setUpiId] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);


    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState("");


    // Pre-fill remaining balance when modal opens
    useEffect(() => {
        if (customer) {
            const remaining = (customer.totalValue ?? 0) - (customer.amountPaid ?? 0);
            setAmount(remaining > 0 ? String(remaining) : "");
        }
    }, [customer]);

    if (!customer) return null;

    const remaining = (customer.totalValue ?? 0) - (customer.amountPaid ?? 0);
    const parsedAmount = parseFloat(amount) || 0;

    const handleSubmit = async () => {
        if (!parsedAmount || parsedAmount <= 0) {
            toast.error("Enter a valid payment amount.");
            return;
        }
        if (parsedAmount > remaining) {
            toast.error(`Amount exceeds remaining balance ₹${fmt(remaining)}.`);
            return;
        }
        if (method === "UPI" && !upiId.trim()) {
            toast.error("Please enter your UPI ID.");
            return;
        }

        setLoading(true);
        try {
            // Build payment payload — adjust fields to match your PaymentRequest DTO
            const payload = {
                customerId: customer.id,
                amount: parsedAmount,
                paymentMethod: method,
                upiId: method === "UPI" ? upiId.trim() : undefined,
                note: note.trim() || undefined,
            };

            // Uncomment when your payment API endpoint is ready:
            // await paymentApi.create(payload);

            // For now we simulate success (remove this when real API is wired)
            await new Promise((r) => setTimeout(r, 900));

            toast.success(`₹${fmt(parsedAmount)} payment recorded successfully!`);
            onSuccess?.();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || "Payment failed. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };



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


    const filteredCustomers = useMemo(() => {
        const keyword = search.toLowerCase();

        return customers.filter((c) =>
            (c.fullName || "").toLowerCase().includes(keyword) ||
            (c.email || "").toLowerCase().includes(keyword) ||
            (c.phone || "").toLowerCase().includes(keyword) ||
            (c.city || "").toLowerCase().includes(keyword)
        );
    }, [customers, search]);


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Make Payment</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{customer.chitGroupName || "Chit Group"}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Auto-fetched Customer Info Card */}
                <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-3 border border-indigo-100">
                    <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {initials(customer.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 truncate">{customer.fullName}</p>
                        <p className="text-xs text-indigo-500">ID: #{customer.customerCode || customer.id}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">Remaining</p>
                        <p className="text-base font-bold text-red-500">₹{fmt(remaining)}</p>
                    </div>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                        { label: "Total Value", value: `₹${fmt(customer.totalValue)}`, color: "text-gray-700" },
                        { label: "Amount Paid", value: `₹${fmt(customer.amountPaid)}`, color: "text-green-600" },
                        { label: "Phone", value: customer.phone || "—", color: "text-gray-600" },
                    ].map((s) => (
                        <div key={s.label} className="bg-gray-50 rounded-lg p-2.5">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                            <p className={`text-xs font-semibold mt-0.5 truncate ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Amount Input */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Payment Amount (₹)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Max ₹${fmt(remaining)}`}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                {/* Payment Method */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMethod(m.id)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${method === m.id
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <span>{m.icon}</span> {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* UPI ID — shown only when UPI is selected */}
                {method === "UPI" && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            UPI ID
                        </label>
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. name@upi"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>
                )}

                {/* Note */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Note (optional)
                    </label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. May installment"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                    >
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : (
                            "🔒"
                        )}
                        {loading ? "Processing…" : `Confirm ₹${fmt(parsedAmount)}`}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Share Modal ─────────────────────────────────────────────────────────────

function ShareModal({ customer, onClose }) {
    const [copied, setCopied] = useState(false);
    if (!customer) return null;

    const profileUrl = `${window.location.origin}/profile/${customer.customerCode || customer.id}`;

    const copyLink = () => {
        navigator.clipboard.writeText(profileUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const shareText = `Hi, I'm ${customer.fullName} (ID: #${customer.customerCode || customer.id}). View my chit profile: ${profileUrl}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">Share Profile</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
                </div>

                {/* Profile Card */}
                <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                            {initials(customer.fullName)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{customer.fullName}</p>
                            <p className="text-xs text-indigo-500">ID: #{customer.customerCode || customer.id}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                            ["Group", customer.chitGroupName || "—"],
                            ["City", customer.city || "—"],
                            ["Total Value", `₹${fmt(customer.totalValue)}`],
                            ["Status", customer.status || "Active"],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <span className="text-xs text-indigo-400 uppercase tracking-wide">{k}</span>
                                <p className="font-medium text-gray-700 truncate">{v}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Share via */}
                <div className="grid grid-cols-2 gap-2">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                    >
                        📱 WhatsApp
                    </a>
                    <a
                        href={`mailto:?subject=My Chit Profile&body=${encodeURIComponent(shareText)}`}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                        📧 Email
                    </a>
                    <a
                        href={`sms:?body=${encodeURIComponent(shareText)}`}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        💬 SMS
                    </a>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        🖨️ Print
                    </button>
                </div>

                {/* Copy link */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Profile Link
                    </label>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={profileUrl}
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 outline-none"
                        />
                        <button
                            onClick={copyLink}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${copied
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                        >
                            {copied ? "✓ Copied" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Chit Card ───────────────────────────────────────────────────────────────

function ChitCard({ customer, onPay, onShare }) {
    const total = customer.totalValue ?? 0;
    const paid = customer.amountPaid ?? 0;
    const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
    const isOverdue = customer.status?.toLowerCase().startsWith("overdue");

    const barColor = isOverdue
        ? "bg-red-500"
        : progress >= 75
            ? "bg-green-500"
            : "bg-indigo-500";

    return (
        <div
            className={`bg-white rounded-2xl border p-5 space-y-4 transition-shadow hover:shadow-md ${isOverdue ? "border-red-200" : "border-gray-100"
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                        {customer.chitGroupName || "Unnamed Group"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        ID: #{customer.customerCode || customer.id} · {customer.city || "—"}
                    </p>
                </div>
                <StatusBadge status={customer.status} />
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Value</p>
                    <p className="font-semibold text-gray-700 mt-0.5">₹{fmt(total)}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Paid</p>
                    <p className="font-semibold text-indigo-600 mt-0.5">₹{fmt(paid)}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Remaining</p>
                    <p className={`font-semibold mt-0.5 ${isOverdue ? "text-red-500" : "text-gray-700"}`}>
                        ₹{fmt(total - paid)}
                    </p>
                </div>
            </div>

            {/* Progress */}
            <ProgressBar value={progress} color={barColor} />

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={() => onPay(customer)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${isOverdue
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                >
                    💳 {isOverdue ? "Clear Overdue" : "Pay Now"}
                </button>
                <button
                    onClick={() => onShare(customer)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    🔗 Share
                </button>
            </div>
        </div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function UserDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);   // single customer record
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [payTarget, setPayTarget] = useState(null);  // customer passed to PaymentModal
    const [shareTarget, setShareTarget] = useState(null);

    // ── Fetch customer by phone (from auth user) or by ID ──────────────────────
    useEffect(() => {
        const fetchCustomer = async () => {
            if (!user) return;
            setLoading(true);
            setError(null);
            try {
                let data = null;

                // Strategy 1: fetch by phone number stored in auth user
                if (user.phone) {
                    data = await customerApi.getByPhone(user.phone);
                }

                // Strategy 2: fallback — search by username / email
                if (!data && user.username) {
                    const result = await customerApi.search(user.username, 0, 1);
                    data = result?.content?.[0] || result?.[0] || null;
                }

                // Strategy 3: fallback — fetch by ID if auth stores customerId
                if (!data && user.customerId) {
                    data = await customerApi.getById(user.customerId);
                }

                setCustomer(data);
            } catch (err) {
                console.error("Failed to fetch customer:", err);
                setError("Could not load your account details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [user]);

    // Refresh after a successful payment
    const refreshCustomer = async () => {
        if (!customer?.id) return;
        try {
            const updated = await customerApi.getById(customer.id);
            setCustomer(updated);
        } catch {
            // silently ignore refresh errors
        }
    };

    const progress = customer
        ? customer.totalValue > 0
            ? Math.round((customer.amountPaid / customer.totalValue) * 100)
            : 0
        : 0;

    // ── Render ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <svg
                        className="w-8 h-8 animate-spin text-indigo-500 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-sm text-gray-400">Loading your account…</p>
                </div>
            </div>
        );
    }

    if (error || !ADMIN) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="text-4xl">😕</div>
                    <p className="text-gray-700 font-semibold">Account not found</p>
                    <p className="text-sm text-gray-400">
                        {error || "No chit account is linked to your login. Contact your agent."}
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-2xl mx-auto p-6 space-y-6">

                {/* ── Top bar ── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {initials(customer.fullName)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-base">{customer.fullName}</p>
                            <p className="text-xs text-gray-400">
                                ID: #{customer.customerCode || customer.id} · {customer.city || "—"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShareTarget(customer)}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            🔗 Share Profile
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            title="Logout"
                            className="p-2 border border-gray-200 bg-white rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                        >
                            🚪
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Chit Value", value: `₹${fmt(customer.totalValue)}`, color: "text-indigo-600" },
                        { label: "Amount Paid", value: `₹${fmt(customer.amountPaid)}`, color: "text-green-600" },
                        {
                            label: "Remaining",
                            value: `₹${fmt((customer.totalValue ?? 0) - (customer.amountPaid ?? 0))}`,
                            color: "text-red-500",
                        },
                        { label: "Progress", value: `${progress}%`, color: "text-purple-600" },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                        >
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                {s.label}
                            </p>
                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Active Chit Card ── */}
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Your Active Chit
                    </p>
                    <ChitCard
                        customer={customer}
                        onPay={setPayTarget}
                        onShare={setShareTarget}
                    />
                </div>

                {/* ── Account Details ── */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Account Details
                    </p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        {[
                            ["Full Name", customer.fullName],
                            ["Phone", customer.phone || "—"],
                            ["Email", customer.email || "—"],
                            ["City", customer.city || "—"],
                            ["Chit Group", customer.chitGroupName || "—"],
                            ["Status", customer.status || "Active"],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{k}</p>
                                <p className="font-medium text-gray-700 mt-0.5 truncate">{v}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-300 pb-4">
                    For support, contact your chit agent.
                </p>
            </div>

            {/* ── Modals ── */}
            {payTarget && (
                <PaymentModal
                    customer={payTarget}
                    onClose={() => setPayTarget(null)}
                    onSuccess={refreshCustomer}
                />
            )}
            {shareTarget && (
                <ShareModal
                    customer={shareTarget}
                    onClose={() => setShareTarget(null)}
                />
            )}
        </div>
    );
}