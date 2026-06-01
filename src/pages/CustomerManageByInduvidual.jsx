import { useEffect, useState } from "react";
import { customerApi } from "../api/customerApi";
import { chitPlanApi } from "../api/chitPlanApi";
import { chitCollectionApi } from "../api/chitCollectionApi";
import api from "../api/axios";

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────────
   STEP BAR
───────────────────────────────────────────────────────────────────────────── */
const STEPS = ["Verify Phone", "Choose Plan", "My Dashboard"];

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
                                className={`text-[10px] mt-1 font-bold uppercase tracking-wider whitespace-nowrap ${active ? "text-gray-900" : done ? "text-emerald-500" : "text-gray-400"
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

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 1 — PHONE VERIFY
   Calls POST /api/v1/auth/customer-login  { phone }
   Backend returns: { data: { token, customer } }
───────────────────────────────────────────────────────────────────────────── */
function PhoneVerifyStep({ onVerified }) {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleaned = phone.replace(/\D/g, "");

        if (cleaned.length !== 10) {
            setError("Enter valid mobile number");
            return;
        }

        setLoading(true);
        setError("");

        try {

            const customer = await customerApi.getByPhone(cleaned);

            if (!customer) {
                throw new Error("Customer not found");
            }

            onVerified(customer);

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                "Customer not found"
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        const customerId = localStorage.getItem("customerId");

        if (customerId) {
            loadCustomer(customerId);
        }

    }, []);


    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Brand */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 text-white text-2xl font-black mb-4 shadow-xl">
                    ₹
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">ChitConnect</h1>
                <p className="text-gray-500 text-sm mt-1">Enter your registered mobile number</p>
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
                        className={`flex items-center border-2 rounded-2xl overflow-hidden transition-all ${error ? "border-red-300" : "border-gray-200 focus-within:border-gray-900"
                            }`}
                    >
                        <span className="px-4 py-4 bg-gray-50 text-gray-500 text-sm font-mono border-r border-gray-200">
                            +91
                        </span>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setError(""); }}
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

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 2 — PLAN SELECTION
───────────────────────────────────────────────────────────────────────────── */
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
                try { data = await chitPlanApi.getAvailable(); }
                catch { data = await chitPlanApi.getAll(); }
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.content)
                        ? data.content
                        : [];
                setPlans(list.filter((p) => p.status !== "INACTIVE" && p.status !== "CLOSED"));
            } catch {
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

    const PALETTES = [
        { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", ring: "ring-violet-400", dot: "bg-violet-500" },
        { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", ring: "ring-amber-400", dot: "bg-amber-500" },
        { bg: "bg-cyan-50", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-700", ring: "ring-cyan-400", dot: "bg-cyan-500" },
        { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", ring: "ring-rose-400", dot: "bg-rose-500" },
        { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-400", dot: "bg-emerald-500" },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Customer chip */}
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    {initials(customer.fullName)}
                </div>
                <div>
                    <p className="font-black text-gray-900 text-sm">{customer.fullName}</p>
                    <p className="text-xs text-gray-400">{customer.phone}</p>
                </div>
                <button
                    onClick={onSkip}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition"
                >
                    Skip, view my plans →
                </button>
            </div>

            <h2 className="text-xl font-black text-gray-900 mb-1">Available Chit Plans</h2>
            <p className="text-sm text-gray-400 mb-5">
                Plans created by your agent. Tap to select and enroll.
            </p>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="font-bold text-gray-700">No plans available right now</p>
                    <p className="text-sm text-gray-400 mt-1">Ask your agent to create a plan.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {plans.map((plan, i) => {
                        const c = PALETTES[i % PALETTES.length];
                        const isSelected = selected?.id === plan.id;
                        return (
                            <button
                                key={plan.id}
                                onClick={() => setSelected(isSelected ? null : plan)}
                                className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected
                                    ? `${c.bg} ${c.border} ring-2 ${c.ring} shadow-md`
                                    : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? `border-transparent ${c.dot}` : "border-gray-300"}`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 text-sm">{plan.planName}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                                                    {fmt(plan.totalValue || plan.chitAmount)}
                                                </span>
                                                {plan.duration && (
                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                                        {plan.duration} months
                                                    </span>
                                                )}
                                                {plan.monthlyInstallment && (
                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                                        {fmt(plan.monthlyInstallment)}/mo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Total</p>
                                        <p className="text-lg font-black text-gray-900">{fmt(plan.totalValue || plan.chitAmount)}</p>
                                    </div>
                                </div>
                                {plan.description && (
                                    <p className="text-xs text-gray-400 mt-2 pl-8 line-clamp-2">{plan.description}</p>
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
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enrolling…</>
                ) : selected ? (
                    `Enroll in "${selected.planName}" →`
                ) : (
                    "Select a plan to enroll"
                )}
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 3 — DASHBOARD  (profile + plans + payment history)
───────────────────────────────────────────────────────────────────────────── */
function ProgressBar({ paid, total, color }) {
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
    return (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
    );
}

const ACCENTS = ["#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];

function PlanCard({ plan, idx, isNew }) {
    const accent = ACCENTS[idx % ACCENTS.length];
    const paid = plan.amountPaid || 0;
    const total = plan.totalValue || plan.chitAmount || 0;
    const pending = Math.max(0, total - paid);

    return (
        <div className={`bg-white rounded-3xl border overflow-hidden shadow-sm ${isNew ? "ring-2 ring-emerald-400" : "border-gray-100"}`}>
            <div className="h-1" style={{ backgroundColor: accent }} />
            <div className="p-5">
                {isNew && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full mb-3">
                        ✓ Just Enrolled
                    </span>
                )}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-black text-gray-900">{plan.planName || `Plan #${plan.id}`}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {plan.enrollmentDate
                                ? `Enrolled ${new Date(plan.enrollmentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
                                : plan.startDate
                                    ? `Starts ${new Date(plan.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
                                    : "Active"}
                        </p>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full" style={{ background: `${accent}18`, color: accent }}>
                        {plan.status || "Active"}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                        { label: "Total", val: fmt(total), cls: "bg-gray-50 text-gray-900" },
                        { label: "Paid", val: fmt(paid), cls: "bg-emerald-50 text-emerald-700" },
                        { label: "Pending", val: fmt(pending), cls: "bg-red-50 text-red-600" },
                    ].map((s) => (
                        <div key={s.label} className={`${s.cls} rounded-xl p-3 text-center`}>
                            <p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">{s.label}</p>
                            <p className="text-sm font-black">{s.val}</p>
                        </div>
                    ))}
                </div>

                {total > 0 && (
                    <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Payment progress</span>
                            <span>{((paid / total) * 100).toFixed(1)}%</span>
                        </div>
                        <ProgressBar paid={paid} total={total} color={accent} />
                    </div>
                )}

                {(plan.totalInstallments || plan.duration) && (
                    <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <span>Installments: <b className="text-gray-800">{plan.paidInstallments || 0} / {plan.totalInstallments || plan.duration}</b></span>
                        {plan.monthlyInstallment && <span>EMI: <b className="text-gray-800">{fmt(plan.monthlyInstallment)}</b></span>}
                    </div>
                )}
            </div>
        </div>
    );
}

function PaymentHistorySection({ customerId }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // adjust endpoint to match your backend
                const res = await api.get(`/payments/customer/${customerId}`);
                const list = res.data?.data || res.data?.content || res.data || [];
                setPayments(Array.isArray(list) ? list : []);
            } catch {
                setPayments([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [customerId]);

    if (loading) return (
        <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
    );

    if (payments.length === 0) return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-2xl mb-1">💳</p>
            <p className="text-sm font-bold text-gray-600">No payment records yet</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        {["Date", "Plan", "Amount", "Status"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-400">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p, i) => (
                        <tr key={p.id || i} className="border-t border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-gray-500 text-xs">
                                {p.paymentDate || p.createdAt
                                    ? new Date(p.paymentDate || p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                    : "—"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{p.planName || p.chitPlanName || "—"}</td>
                            <td className="px-4 py-3 font-black text-gray-900">{fmt(p.amount || p.amountPaid)}</td>
                            <td className="px-4 py-3">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.status === "PAID" || p.status === "SUCCESS"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : p.status === "PENDING"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}>
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

function Dashboard({ customer, newlyEnrolledPlan, onLogout }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("plans"); // "plans" | "history" | "profile"

    useEffect(() => {
        (async () => {
            try {
                const detail = await customerApi.getById(customer.id);
                const list =
                    detail?.enrolledPlans ||
                    detail?.chitPlans ||
                    detail?.plans ||
                    [];
                setPlans(list);
            } catch {
                setPlans(newlyEnrolledPlan ? [newlyEnrolledPlan] : []);
            } finally {
                setLoading(false);
            }
        })();
    }, [customer, newlyEnrolledPlan]);

    const newId = newlyEnrolledPlan?.id;
    const displayPlans = [
        ...plans.filter((p) => p.id === newId || p.chitPlanId === newId),
        ...plans.filter((p) => p.id !== newId && p.chitPlanId !== newId),
    ];
    const finalPlans = displayPlans.length > 0 ? displayPlans : newlyEnrolledPlan ? [newlyEnrolledPlan] : [];

    const totalPaid = finalPlans.reduce((s, p) => s + (p.amountPaid || 0), 0);
    const totalValue = finalPlans.reduce((s, p) => s + (p.totalValue || p.chitAmount || 0), 0);
    const totalPending = Math.max(0, totalValue - totalPaid);

    const TABS = [
        { key: "plans", label: "My Plans", icon: "📋" },
        { key: "history", label: "Payment History", icon: "💳" },
        { key: "profile", label: "Profile", icon: "👤" },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Success banner */}
            {newlyEnrolledPlan && (
                <div className="bg-emerald-500 text-white rounded-2xl p-4 mb-5 flex items-center gap-3 shadow-lg shadow-emerald-100">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0">✓</div>
                    <div>
                        <p className="font-black text-sm">Enrolled Successfully!</p>
                        <p className="text-emerald-100 text-xs mt-0.5">
                            You're now enrolled in <span className="font-bold text-white">{newlyEnrolledPlan.planName}</span>. Saved to your account.
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5">
                <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    {initials(customer.fullName)}
                </div>
                <div>
                    <p className="font-black text-gray-900">{customer.fullName}</p>
                    <p className="text-xs text-gray-400">{customer.phone} · {customer.city || "—"}</p>
                </div>
                <button
                    onClick={onLogout}
                    className="ml-auto text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-full px-3 py-1.5 transition"
                >
                    Sign out
                </button>
            </div>

            {/* Summary stats */}
            {!loading && finalPlans.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: "Plans", val: String(finalPlans.length), accent: "#6366f1" },
                        { label: "Total Paid", val: fmt(totalPaid), accent: "#10b981" },
                        { label: "Pending", val: fmt(totalPending), accent: "#ef4444" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border p-4" style={{ borderColor: `${s.accent}30` }}>
                            <p className="text-[9px] uppercase tracking-widest font-black mb-1" style={{ color: s.accent }}>{s.label}</p>
                            <p className="text-lg font-black text-gray-900">{s.val}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${tab === t.key
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <span>{t.icon}</span> {t.label}
                    </button>
                ))}
            </div>

            {/* Tab: My Plans */}
            {tab === "plans" && (
                loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-40 rounded-3xl bg-gray-100 animate-pulse" />)}
                    </div>
                ) : finalPlans.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <p className="text-3xl mb-2">📋</p>
                        <p className="font-bold text-gray-700">No plans enrolled yet</p>
                        <p className="text-sm text-gray-400 mt-1">Contact your agent to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {finalPlans.map((plan, i) => (
                            <PlanCard
                                key={plan.id || plan.chitPlanId || i}
                                plan={plan}
                                idx={i}
                                isNew={plan.id === newId || plan.chitPlanId === newId}
                            />
                        ))}
                    </div>
                )
            )}

            {/* Tab: Payment History */}
            {tab === "history" && <PaymentHistorySection customerId={customer.id} />}

            {/* Tab: Profile */}
            {tab === "profile" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">My Profile</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                            { label: "Full Name", val: customer.fullName },
                            { label: "Phone", val: customer.phone },
                            { label: "Email", val: customer.email },
                            { label: "City", val: customer.city },
                        ].map((f) => (
                            <div key={f.label}>
                                <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                                <p className="font-bold text-gray-900">{f.val || "—"}</p>
                            </div>
                        ))}
                        {customer.address && (
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400 mb-0.5">Address</p>
                                <p className="font-bold text-gray-900">{customer.address}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Account Status</p>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${customer.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${customer.active ? "bg-emerald-500" : "bg-red-500"}`} />
                                {customer.active ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────────────────── */
export default function CustomerPortal() {
    const [step, setStep] = useState(0);
    const [customer, setCustomer] = useState(null);
    const [enrolledPlan, setEnrolledPlan] = useState(null);

    const handleVerified = (c) => { setCustomer(c); setStep(1); };
    const handleEnrolled = (plan) => { setEnrolledPlan(plan); setStep(2); };
    const handleSkip = () => setStep(2);
    const handleLogout = () => {
        localStorage.removeItem("token");
        setCustomer(null);
        setEnrolledPlan(null);
        setStep(0);
    };

    return (
        <div className="min-h-screen bg-[#f3f2ee] px-4 py-10">
            <StepBar current={step} />
            {step === 0 && <PhoneVerifyStep onVerified={handleVerified} />}
            {step === 1 && <PlanSelectStep customer={customer} onEnrolled={handleEnrolled} onSkip={handleSkip} />}
            {step === 2 && <Dashboard customer={customer} newlyEnrolledPlan={enrolledPlan} onLogout={handleLogout} />}
        </div>
    );
}