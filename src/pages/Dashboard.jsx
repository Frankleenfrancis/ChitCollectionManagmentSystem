import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerApi } from "../api/customerApi";
import { chitPlanApi } from "../api/chitPlanApi";
import { chitCollectionApi } from "../api/chitCollectionApi";
import api from "../api/axios";
import { useAuth } from "../components/AuthContext";

const fmt = (v) =>
    v == null
        ? "₹0"
        : `₹${Number(v).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;

const initials = (name) =>
    name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??";

const STEPS = ["Verify Phone", "My Dashboard", "Choose Plan",];

function StepBar({ current }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${done
                                    ? "bg-emerald-500 text-white"
                                    : active
                                        ? "bg-gray-900 text-white ring-4 ring-gray-200"
                                        : "bg-gray-200 text-gray-400"
                                    }`}
                            >
                                {done ? "✓" : i + 1}
                            </div>
                            <span
                                className={`text-[10px] mt-1 font-bold uppercase tracking-wider whitespace-nowrap ${active
                                    ? "text-gray-900"
                                    : done
                                        ? "text-emerald-500"
                                        : "text-gray-400"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`w-16 h-0.5 mx-1 mb-4 transition-all duration-500 ${done ? "bg-emerald-400" : "bg-gray-200"
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function PhoneVerifyStep({ onVerified }) {
    const { user, logout } = useAuth(); 
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedCustomerId = localStorage.getItem("customerId");
        if (!storedCustomerId) return;
        (async () => {
            try {
                const customer = await customerApi.getById(storedCustomerId);
               
                if (customer?.id && String(customer.id) === String(user?.customerId)) {
                    onVerified(customer);
                } else {
                    localStorage.removeItem("customerId");
                }
            } catch {
                localStorage.removeItem("customerId");
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length !== 10) {
            setError("Enter valid 10-digit mobile number");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const customer = await customerApi.getByPhone(cleaned);
            if (!customer?.id) throw new Error("Customer not found");

           
            if (String(customer.id) !== String(user?.customerId)) {
                throw new Error("This phone number does not match your account");
            }

            localStorage.setItem("customerId", customer.id);
            onVerified(customer);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||             
                "Customer not found with this number."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 text-white text-2xl font-black mb-4 shadow-xl">
                    ₹
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    ChitConnect
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Enter your registered mobile number
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-5"
            >
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                        Mobile Number
                    </label>
                    <div
                        className={`flex items-center border-2 rounded-2xl overflow-hidden transition-all ${error
                            ? "border-red-300"
                            : "border-gray-200 focus-within:border-gray-900"
                            }`}
                    >
                        <span className="px-4 py-4 bg-gray-50 text-gray-500 text-sm font-mono border-r border-gray-200">
                            +91
                        </span>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                setError("");
                            }}
                            placeholder="98765 43210"
                            maxLength={10}
                            className="flex-1 px-4 py-4 text-gray-900 font-mono text-base outline-none bg-white placeholder-gray-300"
                        />
                    </div>
                    {error && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <span>⚠</span> {error}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || phone.replace(/\D/g, "").length < 10}
                    className="w-full py-4 rounded-2xl bg-gray-900 text-white font-black text-sm tracking-wide transition-all hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verifying…
                        </>
                    ) : (
                        "Verify & Continue →"
                    )}
                </button>
            </form>
        </div>
    );
}


const PALETTES = [
    {
        bg: "bg-violet-50",
        border: "border-violet-200",
        badge: "bg-violet-100 text-violet-700",
        ring: "ring-violet-400",
        dot: "bg-violet-500",
    },
    {
        bg: "bg-amber-50",
        border: "border-amber-200",
        badge: "bg-amber-100 text-amber-700",
        ring: "ring-amber-400",
        dot: "bg-amber-500",
    },
    {
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        badge: "bg-cyan-100 text-cyan-700",
        ring: "ring-cyan-400",
        dot: "bg-cyan-500",
    },
    {
        bg: "bg-rose-50",
        border: "border-rose-200",
        badge: "bg-rose-100 text-rose-700",
        ring: "ring-rose-400",
        dot: "bg-rose-500",
    },
    {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        badge: "bg-emerald-100 text-emerald-700",
        ring: "ring-emerald-400",
        dot: "bg-emerald-500",
    },
];

function PlanSelectStep({ customer, onEnrolled, onSkip }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                let data;
                try {
                    data = await chitPlanApi.getAvailable();
                } catch {
                    data = await chitPlanApi.getAll(0, 100);
                }
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.content)
                        ? data.content
                        : Array.isArray(data?.data)
                            ? data.data
                            : Array.isArray(data?.data?.content)
                                ? data.data.content
                                : [];
                setPlans(
                    list.filter(
                        (p) => p.status !== "INACTIVE" && p.status !== "CLOSED"
                    )
                );
            } catch (err) {
                console.error("Plan fetch error:", err);
                setPlans([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleEnroll = async () => {
        if (!selected) return;
        setEnrolling(true);
        setError("");
        try {
            await chitCollectionApi.enrollCustomer({
                customerId: customer.id,
                chitPlanId: selected.id,
            });
            onEnrolled(selected);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Enrollment failed. You may already be enrolled or the plan is full."
            );
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    {initials(customer.fullName)}
                </div>
                <div>
                    <p className="font-black text-gray-900 text-sm">
                        {customer.fullName}
                    </p>
                    <p className="text-xs text-gray-400">{customer.phone}</p>
                </div>

            </div>

            <h2 className="text-xl font-black text-gray-900 mb-1">
                Available Chit Plans
            </h2>
            <p className="text-sm text-gray-400 mb-5">
                Plans created by your agent. Tap to select and enroll.
            </p>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-28 rounded-2xl bg-gray-100 animate-pulse"
                        />
                    ))}
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="font-bold text-gray-700">
                        No plans available right now
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        Ask your agent to create a plan.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {plans.map((plan, i) => {
                        const c = PALETTES[i % PALETTES.length];
                        const isSelected = selected?.id === plan.id;
                        return (
                            <button
                                key={plan.id}
                                onClick={() =>
                                    setSelected(isSelected ? null : plan)
                                }
                                className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected
                                    ? `${c.bg} ${c.border} ring-2 ${c.ring} shadow-md`
                                    : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div
                                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                                ? `border-transparent ${c.dot}`
                                                : "border-gray-300"
                                                }`}
                                        >
                                            {isSelected && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    viewBox="0 0 12 12"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M2 6l3 3 5-5"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 text-sm">
                                                {plan.planName}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span
                                                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}
                                                >
                                                    {fmt(
                                                        plan.totalAmount ||
                                                        plan.chitAmount
                                                    )}
                                                </span>
                                                {plan.duration && (
                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                                        {plan.duration} months
                                                    </span>
                                                )}
                                                {plan.monthlyInstallment && (
                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                                        {fmt(
                                                            plan.monthlyInstallment
                                                        )}
                                                        /mo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">
                                            Total
                                        </p>
                                        <p className="text-lg font-black text-gray-900">
                                            {fmt(
                                                plan.totalAmount ||
                                                plan.chitAmount
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {plan.description && (
                                    <p className="text-xs text-gray-400 mt-2 pl-8 line-clamp-2">
                                        {plan.description}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-5 py-3 flex gap-2">
                    <span>⚠</span> {error}
                </div>
            )}

            <button
                onClick={handleEnroll}
                disabled={!selected || enrolling}
                className="w-full mt-6 py-4 rounded-2xl bg-gray-900 text-white font-black text-sm tracking-wide transition-all hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {enrolling ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enrolling…
                    </>
                ) : selected ? (
                    `Enroll in "${selected.planName}" →`
                ) : (
                    "Select a plan to enroll"
                )}
            </button>
        </div>
    );
}


function Icon({ name, className = "w-5 h-5" }) {
    const icons = {
        grid: (
            <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
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
    };
    return icons[name] || null;
}


function ProgressBar({ paid, total, color }) {
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
    return (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
            />
        </div>
    );
}


function PaymentHistorySection({ customerId }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/payments/customer/${customerId}`);
                const page = res.data?.data;
                const data =
                    page?.content ?? res.data?.content ?? res.data ?? [];
                setPayments(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(
                    "Payments error:",
                    err.response?.status,
                    err.response?.data
                );
                setPayments([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [customerId]);

    if (loading)
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-12 rounded-xl bg-gray-100 animate-pulse"
                    />
                ))}
            </div>
        );

    if (payments.length === 0)
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-2xl mb-1">💳</p>
                <p className="text-sm font-bold text-gray-600">
                    No payment records yet
                </p>
            </div>
        );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        {["Date", "Plan", "Amount", "Status"].map((h) => (
                            <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-400"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p, i) => (
                        <tr
                            key={p.id || i}
                            className="border-t border-gray-50 hover:bg-gray-50 transition"
                        >
                            <td className="px-4 py-3 text-gray-500 text-xs">
                                {p.paymentDate || p.createdAt
                                    ? new Date(
                                        p.paymentDate || p.createdAt
                                    ).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })
                                    : "—"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-800">
                                {p.planName || p.chitPlanName || "—"}
                            </td>
                            <td className="px-4 py-3 font-black text-gray-900">
                                {fmt(p.amount || p.amountPaid)}
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.status === "PAID" ||
                                        p.status === "SUCCESS"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : p.status === "PENDING"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {p.status || "Recorded"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


function buildStatsCards(plans) {
    const totalPaid = plans.reduce(
        (s, p) => s + (p.amountPaid || p.totalPaid || 0),
        0
    );
    const totalValue = plans.reduce(
        (s, p) =>
            s + (p.totalAmount || p.chitAmount || p.chitPlan?.totalValue || 0),
        0
    );
    const totalPending = Math.max(0, totalValue - totalPaid);

    return [
        {
            title: "Total Invested",
            value: fmt(totalValue),
            change: null,
            sub: `${plans.length} active plan${plans.length !== 1 ? "s" : ""}`,
            color: "text-blue-500",
            bg: "bg-blue-50",
            iconBg: "bg-blue-50",
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                </svg>
            ),
        },
        {
            title: "Total Paid",
            value: fmt(totalPaid),
            change: null,
            sub: "across all plans",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                </svg>
            ),
        },
        {
            title: "Total Pending",
            value: fmt(totalPending),
            change: null,
            sub: "remaining balance",
            color: "text-rose-500",
            bg: "bg-rose-50",
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
            ),
        },
        {
            title: "Next Due",
            value: plans.length > 0 ? fmt(plans[0]?.monthlyInstallment || plans[0]?.chitPlan?.monthlyInstallment) : "—",
            sub: "upcoming installment",
            subColor: "text-orange-500",
            bg: "bg-orange-50",
            border: "border-orange-200",
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
}

const ACCENTS = ["#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];

function PlanRow({ plan, idx, isNew, navigate }) {
    const accent = ACCENTS[idx % ACCENTS.length];
    const planName =
        plan.planName ||
        plan.chitPlanName ||
        plan.chitPlan?.planName ||
        `Plan #${plan.id}`;
    const paid = plan.amountPaid || plan.totalPaid || plan.paidAmount || 0;
    const total =
        plan.totalAmount ||
        plan.chitAmount ||
        plan.chitPlan?.totalValue ||
        0;
    const duration = plan.duration || plan.chitPlan?.duration;
    const emi =
        plan.monthlyInstallment || plan.chitPlan?.monthlyInstallment;
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
    const paidInstallments = plan.paidInstallments || 0;
    const totalInstallments = plan.totalInstallments || duration || 0;

    return (
        <tr className="border-t border-gray-50 hover:bg-gray-50 transition">
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: accent }}
                    />
                    <div>
                        <div className="text-sm font-semibold text-gray-800">
                            {planName}
                        </div>
                        {isNew && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                                ✓ Just Enrolled
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-3 py-3.5">
                <div className="text-xs text-gray-500 mb-1.5">
                    {paidInstallments}/{totalInstallments}&nbsp;
                    <span className="text-gray-400">
                        {pct.toFixed(0)}%
                    </span>
                </div>
                <div className="w-28 bg-gray-100 rounded-full h-1.5">
                    <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                            width: `${pct}%`,
                            backgroundColor: accent,
                        }}
                    />
                </div>
            </td>
            <td className="px-3 py-3.5">
                <div className="text-sm font-semibold text-gray-800">
                    {emi ? fmt(emi) : "—"}
                </div>
                <div className="text-[11px] mt-0.5 text-gray-400">
                    per month
                </div>
            </td>
            <td className="px-3 py-3.5">
                <button
                    onClick={() =>
                        navigate &&
                        navigate(
                            `/user/dashboard/collections/payment/${plan.id}`
                        )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                    Pay Now
                </button>
            </td>
        </tr>
    );
}


const sidebarItems = [
    { label: "Dashboard", icon: "grid", path: "/user/dashboard" },
    { label: "My Chits", icon: "user", path: "/user/customer/dashboard" },
    { label: "Payment", icon: "credit-card" },
    { label: "Settings", icon: "settings" },
    { label: "Logout", icon: "logout", action: "logout" },
];

const recentActivity = [
    {
        title: "Payment Successful",
        sub: "Installment recorded",
        time: "Recently",
        iconBg: "bg-green-100",
        iconColor: "text-green-500",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
            </svg>
        ),
    },
    {
        title: "Auction Results",
        sub: "Chit auction completed",
        time: "This week",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-500",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 3l7 7" /><path d="M13 3l7 7" /><path d="M10 10l4 4" /><path d="M3 21l9-9" />
            </svg>
        ),
    },
    {
        title: "New Chit Available",
        sub: "New plan starting soon",
        time: "This month",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
    },
];

function Dashboard({ customer, newlyEnrolledPlan, onLogout }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNav, setActiveNav] = useState("Dashboard");
    const [tab, setTab] = useState("plans");
    const navigate = useNavigate();
    const goHome = () => navigate("/user/dashboard");
    const { logout } = useAuth();

    useEffect(() => {
        (async () => {
            try {
                const enrollData =
                    await chitCollectionApi.getEnrollmentsByCustomer(
                        customer.id
                    );
                const list = Array.isArray(enrollData)
                    ? enrollData
                    : Array.isArray(enrollData?.content)
                        ? enrollData.content
                        : Array.isArray(enrollData?.data)
                            ? enrollData.data
                            : [];
                setPlans(list);
            } catch (err) {
                console.error(
                    "Dashboard load error:",
                    err.response?.status,
                    err.response?.data
                );
                setPlans(newlyEnrolledPlan ? [newlyEnrolledPlan] : []);
            } finally {
                setLoading(false);
            }
        })();
    }, [customer.id, newlyEnrolledPlan]);

    const newId = newlyEnrolledPlan?.id;
    const displayPlans = [
        ...plans.filter((p) => p.id === newId || p.chitPlanId === newId),
        ...plans.filter((p) => p.id !== newId && p.chitPlanId !== newId),
    ];
    const finalPlans =
        displayPlans.length > 0
            ? displayPlans
            : newlyEnrolledPlan
                ? [newlyEnrolledPlan]
                : [];

    const statsCards = buildStatsCards(finalPlans);
    const urgentPlan = finalPlans[0];
    const urgentEmi =
        urgentPlan?.monthlyInstallment ||
        urgentPlan?.chitPlan?.monthlyInstallment;

    const TABS = [
        { key: "plans", label: "My Plans", icon: "📋" },
        { key: "history", label: "Payment History", icon: "💳" },
        { key: "profile", label: "Profile", icon: "👤" },
    ];


    const handleLogout = () => {
        logout(); 
        window.location.href = "/login";
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
          
            <aside className="w-44 bg-white flex flex-col py-5 px-3 border-r border-gray-100 shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-2 px-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-800 leading-tight">
                            ChitFund Pro
                        </div>
                        <div className="text-[10px] text-gray-400">
                            Manage Investments
                        </div>
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
                                : item.label === "Logout"
                                    ? "text-red-400 hover:bg-red-50 hover:text-red-600"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                        >
                            <Icon name={item.icon} className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User footer */}
                <div className="flex items-center gap-2 px-2 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials(customer.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-gray-800 truncate">
                            {customer.fullName}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                            {customer.city || "Member"}
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back,{" "}
                                {customer.fullName.split(" ")[0]}
                            </h1>
                            <p className="text-sm text-gray-400 mt-0.5">
                                Today is{" "}
                                {new Date().toLocaleDateString("en-IN", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/user/customer/enrollChits")}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            Join New Chit
                        </button>
                    </div>

                    {/* Success banner */}
                    {newlyEnrolledPlan && (
                        <div className="bg-emerald-500 text-white rounded-xl p-4 mb-6 flex items-center gap-3 shadow-lg shadow-emerald-100">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0">
                                ✓
                            </div>
                            <div>
                                <p className="font-black text-sm">
                                    Enrolled Successfully!
                                </p>
                                <p className="text-emerald-100 text-xs mt-0.5">
                                    You're now enrolled in{" "}
                                    <span className="font-bold text-white">
                                        {newlyEnrolledPlan.planName}
                                    </span>
                                    .
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats Row */}
                    {!loading && finalPlans.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            {statsCards.map((card, i) => (
                                <div
                                    key={i}
                                    className={`bg-white rounded-xl p-4 border ${card.border
                                        ? card.border
                                        : "border-gray-100"
                                        } shadow-sm`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs text-gray-500 font-medium">
                                            {card.title}
                                        </span>
                                        <div
                                            className={`w-8 h-8 rounded-full ${card.bg} flex items-center justify-center`}
                                        >
                                            {card.icon}
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {card.value}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {card.change && (
                                            <span
                                                className={`text-xs font-medium ${card.color}`}
                                            >
                                                {card.change}
                                            </span>
                                        )}
                                        <span
                                            className={`text-xs ${card.subColor
                                                ? card.subColor
                                                : "text-gray-400"
                                                }`}
                                        >
                                            {card.sub}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5 w-fit shadow-sm">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <span>{t.icon}</span> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Plans / History / Profile panel */}
                        <div className="col-span-2">
                            {/* ── My Plans Tab ── */}
                            {tab === "plans" && (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">
                                                My Active Plans
                                            </h2>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Your enrolled chit fund plans
                                            </p>
                                        </div>
                                    </div>
                                    {loading ? (
                                        <div className="p-5 space-y-3">
                                            {[1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-16 rounded-xl bg-gray-100 animate-pulse"
                                                />
                                            ))}
                                        </div>
                                    ) : finalPlans.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <p className="text-3xl mb-2">📋</p>
                                            <p className="font-bold text-gray-700">
                                                No plans enrolled yet
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Contact your agent to get
                                                started.
                                            </p>
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-[11px] text-gray-400 uppercase tracking-wide">
                                                    <th className="text-left px-5 py-3 font-medium">
                                                        Plan
                                                    </th>
                                                    <th className="text-left px-3 py-3 font-medium">
                                                        Progress
                                                    </th>
                                                    <th className="text-left px-3 py-3 font-medium">
                                                        Monthly EMI
                                                    </th>
                                                    <th className="text-left px-3 py-3 font-medium">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {finalPlans.map((plan, i) => (
                                                    <PlanRow
                                                        key={plan.id || plan.chitPlanId || i}
                                                        plan={plan}
                                                        idx={i}
                                                        isNew={plan.id === newId || plan.chitPlanId === newId}
                                                        navigate={navigate}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* ── Payment History Tab ── */}
                            {tab === "history" && (
                                <PaymentHistorySection
                                    customerId={customer.id}
                                />
                            )}

                            {/* ── Profile Tab ── */}
                            {tab === "profile" && (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                                        My Profile
                                    </h3>
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 flex items-center justify-center text-white text-lg font-bold">
                                            {initials(customer.fullName)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">
                                                {customer.fullName}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {customer.phone}
                                            </p>
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mt-1 ${customer.active
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${customer.active
                                                        ? "bg-emerald-500"
                                                        : "bg-red-500"
                                                        }`}
                                                />
                                                {customer.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {[
                                            {
                                                label: "Email",
                                                val: customer.email,
                                            },
                                            {
                                                label: "City",
                                                val: customer.city,
                                            },
                                        ].map((f) => (
                                            <div key={f.label}>
                                                <p className="text-xs text-gray-400 mb-0.5">
                                                    {f.label}
                                                </p>
                                                <p className="font-bold text-gray-900">
                                                    {f.val || "—"}
                                                </p>
                                            </div>
                                        ))}
                                        {customer.address && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-400 mb-0.5">
                                                    Address
                                                </p>
                                                <p className="font-bold text-gray-900">
                                                    {customer.address}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                <div className="text-xs text-blue-200 mb-0.5">
                                    Upcoming Payment
                                </div>
                                <div className="text-sm font-semibold mb-1">
                                    {urgentPlan
                                        ? urgentPlan.planName ||
                                        urgentPlan.chitPlanName ||
                                        "Your Plan"
                                        : "—"}
                                </div>
                                <div className="text-3xl font-bold mb-4">
                                    {urgentEmi ? fmt(urgentEmi) : "—"}
                                </div>
                                <button
                                    className="w-full bg-white text-blue-600 text-sm font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                    onClick={() =>
                                        urgentPlan &&
                                        navigate(
                                            `/user/dashboard/collections/payment/${urgentPlan.id}`
                                        )
                                    }
                                >
                                    Make Payment Now
                                </button>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-1">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                                    Recent Activity
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {recentActivity.map((act, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 bg-gray-50 rounded-lg p-3"
                                        >
                                            <div
                                                className={`w-9 h-9 rounded-full ${act.iconBg} flex items-center justify-center flex-shrink-0`}
                                            >
                                                {act.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold text-gray-800">
                                                    {act.title}
                                                </div>
                                                <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                                                    {act.sub}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {act.time}
                                                </div>
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
                    © {new Date().getFullYear()} ChitFund Pro. All rights
                    reserved.
                </div>
            </main>
        </div>
    );
}


export default function CustomerPortal() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [customer, setCustomer] = useState(null);
    const [enrolledPlan, setEnrolledPlan] = useState(null);
    const [loggedOut, setLoggedOut] = useState(false);

    const handleVerified = (c) => {
        setCustomer(c);
        setStep(2);
    };
    const handleEnrolled = (plan) => {
        setEnrolledPlan(plan);
        setStep(2);
    };
    const handleSkip = () => setStep(2);

    const handleLogout = () => {
        localStorage.removeItem("customerId");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

   
    if (step === 2) {
        return (
            <Dashboard
                customer={customer}
                newlyEnrolledPlan={enrolledPlan}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f2ee] px-4 py-10">
            <StepBar current={step} />
            {step === 0 && (
                <PhoneVerifyStep onVerified={handleVerified} />
            )}
            {step === 1 && (
                <PlanSelectStep
                    onEnrolled={handleEnrolled}
                    customer={customer}
                />
            )}
        </div>
    );
}
