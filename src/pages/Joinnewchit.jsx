import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chitPlanApi } from "../api/chitPlanApi";
import { chitCollectionApi } from "../api/chitCollectionApi";
import { customerApi } from "../api/customerApi";

/* ─── Utilities ─── */
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

/* ─── Palettes ─── */
const PALETTES = [
    { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", ring: "ring-violet-400", dot: "bg-violet-500", accent: "#7c3aed" },
    { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", ring: "ring-amber-400", dot: "bg-amber-500", accent: "#d97706" },
    { bg: "bg-cyan-50", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-700", ring: "ring-cyan-400", dot: "bg-cyan-500", accent: "#0891b2" },
    { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", ring: "ring-rose-400", dot: "bg-rose-500", accent: "#e11d48" },
    { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-400", dot: "bg-emerald-500", accent: "#059669" },
];

/* ─── Success Modal ─── */
function SuccessModal({ plan, onGoHome }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-[fadeInScale_0.3s_ease]">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="9 12 11 14 15 10" />
                    </svg>
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Enrolled!</h2>
                <p className="text-sm text-gray-500 mb-1">
                    You've successfully joined
                </p>
                <p className="text-base font-bold text-gray-900 mb-6">
                    {plan?.planName}
                </p>
                <button
                    onClick={onGoHome}
                    className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-black text-sm tracking-wide hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}

/* ─── Main Component ─── */
export default function JoinNewChit() {
    const navigate = useNavigate();

    // Customer state
    const [customer, setCustomer] = useState(null);
    const [customerLoading, setCustomerLoading] = useState(true);

    // Plans state
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    // Enrollment state
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState("");
    const [enrolledPlan, setEnrolledPlan] = useState(null);

    /* Load customer from localStorage */
    useEffect(() => {
        const customerId = localStorage.getItem("customerId");
        if (!customerId) {
            setCustomerLoading(false);
            return;
        }
        (async () => {
            try {
                const c = await customerApi.getById(customerId);
                if (c?.id) setCustomer(c);
            } catch {
                // customer not found
            } finally {
                setCustomerLoading(false);
            }
        })();
    }, []);

    /* Load available plans */
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
                setPlans(list.filter((p) => p.status !== "INACTIVE" && p.status !== "CLOSED"));
            } catch {
                setPlans([]);
            } finally {
                setPlansLoading(false);
            }
        })();
    }, []);

    const handleEnroll = async () => {
        if (!selected || !customer) return;
        setEnrolling(true);
        setEnrollError("");
        try {
            await chitCollectionApi.enrollCustomer({
                customerId: customer.id,
                chitPlanId: selected.id,
            });
            setEnrolledPlan(selected);
        } catch (err) {
            setEnrollError(
                err?.response?.data?.message ||
                "Enrollment failed. You may already be enrolled or the plan is full."
            );
        } finally {
            setEnrolling(false);
        }
    };

    const goHome = () => navigate("/user/dashboard");

    /* ── Loading skeleton ── */
    const isLoading = customerLoading || plansLoading;

    return (
        <>
            {/* Success overlay */}
            {enrolledPlan && (
                <SuccessModal plan={enrolledPlan} onGoHome={goHome} />
            )}

            <div className="min-h-screen bg-gray-50 font-sans">
                {/* ── Top Nav Bar ── */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                        {/* Brand */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-800 leading-tight">ChitFund Pro</div>
                                <div className="text-[10px] text-gray-400">Join a New Plan</div>
                            </div>
                        </div>

                        {/* Home button */}
                        <button
                            onClick={goHome}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition-all"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Home
                        </button>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto px-4 py-8">

                    {/* ── Page Title ── */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Join a New Chit</h1>
                        <p className="text-sm text-gray-400 mt-1">Select a plan below and confirm your enrollment.</p>
                    </div>

                    {/* ── Customer Card ── */}
                    {customerLoading ? (
                        <div className="h-20 rounded-2xl bg-gray-100 animate-pulse mb-6" />
                    ) : customer ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                {initials(customer.fullName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-gray-900 text-sm">{customer.fullName}</p>
                                <p className="text-xs text-gray-400">{customer.phone}</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${customer.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                                {customer.active ? "● Active" : "● Inactive"}
                            </span>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 text-sm text-amber-700 flex items-center gap-2">
                            <span>⚠</span> Could not load your customer profile. Please go back and verify your number.
                        </div>
                    )}

                    {/* ── Section Label ── */}
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Available Plans</h2>
                        <span className="text-xs text-gray-400">{plans.length} plan{plans.length !== 1 ? "s" : ""} available</span>
                    </div>

                    {/* ── Plans List ── */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <p className="text-4xl mb-3">📋</p>
                            <p className="font-bold text-gray-700">No plans available right now</p>
                            <p className="text-sm text-gray-400 mt-1">Ask your agent to create a plan.</p>
                            <button onClick={goHome} className="mt-5 text-sm font-semibold text-blue-600 hover:underline">
                                ← Back to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {plans.map((plan, i) => {
                                const c = PALETTES[i % PALETTES.length];
                                const isSelected = selected?.id === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => {
                                            setSelected(isSelected ? null : plan);
                                            setEnrollError("");
                                        }}
                                        className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected
                                            ? `${c.bg} ${c.border} ring-2 ${c.ring} shadow-md`
                                            : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                {/* Radio dot */}
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
                                                            {fmt(plan.totalAmount || plan.chitAmount)}
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
                                                        {plan.maxMembers && (
                                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                                                                Max {plan.maxMembers} members
                                                            </span>
                                                        )}
                                                    </div>
                                                    {plan.description && (
                                                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{plan.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Total value callout */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Total Value</p>
                                                <p className="text-lg font-black text-gray-900">
                                                    {fmt(plan.totalAmount || plan.chitAmount)}
                                                </p>
                                                {plan.monthlyInstallment && (
                                                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                                        {fmt(plan.monthlyInstallment)} / mo
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}


                    {enrollError && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-5 py-3 flex gap-2">
                            <span>⚠</span> {enrollError}
                        </div>
                    )}

                    {/* ── Enroll Button ── */}
                    {plans.length > 0 && (
                        <button
                            onClick={handleEnroll}
                            disabled={!selected || enrolling || !customer}
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
                    )}

                    {/* ── Cancel link ── */}
                    <div className="text-center mt-4">
                        <button onClick={goHome} className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition">
                            Cancel, go back to dashboard
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.92); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}