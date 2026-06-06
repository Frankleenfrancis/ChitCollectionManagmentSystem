import { useState, useEffect } from "react";
import { chitCollectionApi } from "../api/chitCollectionApi";


const today = () => new Date().toISOString().split("T")[0];

const fmt = (n) =>
    "₹" + Number(n || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function RecordCollectionForm({ onSuccess, onBack }) {


    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);


    const [selectedId, setSelectedId] = useState("");
    const [activeEnrollment, setActiveEnrollment] = useState(null);


    const [monthNumber, setMonthNumber] = useState("");
    const [dueDate, setDueDate] = useState(today());
    const [dueAmount, setDueAmount] = useState("");
    const [remarks, setRemarks] = useState("");


    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);


    useEffect(() => {
        (async () => {
            try {
                setEnrollmentsLoading(true);
                const data = await chitCollectionApi.getAllEnrollments(0, 100);
                // getAllEnrollments returns a Page — extract .content
                const list = Array.isArray(data) ? data : (data?.content ?? []);
                setEnrollments(list);
            } catch {
                showToast("Failed to load enrollments.", "error");
            } finally {
                setEnrollmentsLoading(false);
            }
        })();
    }, []);


    const handleSelect = (id) => {
        setSelectedId(id);
        setToast(null);

        if (!id) {
            setActiveEnrollment(null);
            resetFields();
            return;
        }

        const enroll = enrollments.find((e) => String(e.id) === String(id));
        if (!enroll) return;

        setActiveEnrollment(enroll);


        const nextMonth = (enroll.paidMonths ?? 0) + 1;
        setMonthNumber(String(nextMonth));


        setDueAmount(String(enroll.monthlyAmount ?? enroll.chitPlan?.monthlyAmount ?? ""));


        setDueDate(today());


        setRemarks(`Month ${nextMonth} collection entry`);
    };

    const resetFields = () => {
        setMonthNumber("");
        setDueDate(today());
        setDueAmount("");
        setRemarks("");
    };

    const showToast = (text, type = "success") => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 4000);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeEnrollment) return;

        setSubmitting(true);
        setToast(null);


        const payload = {
            enrollmentId: Number(selectedId),
            monthNumber: Number(monthNumber),
            dueDate: dueDate,            // "yyyy-MM-dd"
            dueAmount: parseFloat(dueAmount),
            remarks: remarks.trim() || null,
        };

        try {
            await chitCollectionApi.createCollectionEntry(payload);
            showToast(
                `Month ${monthNumber} collection entry created for ${activeEnrollment.customerName}. They can now make a payment.`,
                "success"
            );



            const nextMonth = Number(monthNumber) + 1;
            if (nextMonth <= (activeEnrollment.totalMonths ?? activeEnrollment.durationMonths ?? 99)) {
                setMonthNumber(String(nextMonth));
                setRemarks(`Month ${nextMonth} collection entry`);
            } else {
                resetFields();
                setSelectedId("");
                setActiveEnrollment(null);
            }


            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            }

        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create collection entry.";
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

            {/* ── Top bar ── */}
            <div className="bg-white border-b border-gray-100 px-6 py-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    ← Back
                </button>
                <h1 className="text-center text-2xl font-bold text-gray-900 mt-4">
                    Record Collection Entry
                </h1>
                <p className="text-xs text-center text-gray-500 mt-0.5">
                    Create a monthly due entry for an enrolled customer so they can make payments.
                </p>
            </div>

            <div className="flex-1 max-w-xl mx-auto w-full px-5 py-6 flex flex-col gap-5">

                {/* ── Toast ── */}
                {toast && (
                    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm border
            ${toast.type === "success"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"}`}>
                        {toast.type === "success"
                            ? <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            : <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                        }
                        <span>{toast.text}</span>
                    </div>
                )}

                {/* ── Step 1: Select Enrollment ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">Step 1</p>
                        <h2 className="text-sm font-bold mt-0.5">Select Enrolled Customer</h2>
                    </div>

                    <div className="px-5 py-5">
                        {enrollmentsLoading ? (
                            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                        ) : enrollments.length === 0 ? (
                            <div className="text-sm text-gray-400 text-center py-4">
                                No active enrollments found. Enroll a customer first.
                            </div>
                        ) : (
                            <select
                                value={selectedId}
                                onChange={(e) => handleSelect(e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                            >
                                <option value="">— Select an enrollment —</option>
                                {[...enrollments]
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .map((enroll) => (
                                        <option key={enroll.id} value={enroll.id}>
                                            #{enroll.id} · {enroll.customerName} · {enroll.customerPhone} — {enroll.chitPlanName}
                                            {enroll.paidMonths != null
                                                ? ` (Month ${enroll.paidMonths}/${enroll.totalMonths} paid)`
                                                : ""}
                                        </option>
                                    ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* ── Selected enrollment info card ── */}
                {activeEnrollment && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-[10px] text-blue-400 uppercase font-semibold">Customer</p>
                            <p className="text-sm font-bold text-blue-800 mt-0.5 truncate">{activeEnrollment.customerName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-400 uppercase font-semibold">Chit Plan</p>
                            <p className="text-sm font-bold text-blue-800 mt-0.5 truncate">{activeEnrollment.chitPlanName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-400 uppercase font-semibold">Monthly Due</p>
                            <p className="text-sm font-bold text-blue-800 mt-0.5">{fmt(activeEnrollment.monthlyAmount)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-400 uppercase font-semibold">Progress</p>
                            <p className="text-sm font-bold text-blue-800 mt-0.5">
                                {activeEnrollment.paidMonths ?? 0}/{activeEnrollment.totalMonths ?? "?"} months
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-400 uppercase font-semibold">Total Paid</p>
                            <p className="text-sm font-bold text-green-700 mt-0.5">{fmt(activeEnrollment.totalPaid)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-400 uppercase font-semibold">Pending</p>
                            <p className="text-sm font-bold text-orange-500 mt-0.5">{fmt(activeEnrollment.pendingAmount)}</p>
                        </div>
                    </div>
                )}

                {/* ── Step 2: Collection Entry Form ── */}
                <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-opacity
          ${!activeEnrollment ? "opacity-40 pointer-events-none" : ""}`}>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">Step 2</p>
                        <h2 className="text-sm font-bold mt-0.5">Collection Entry Details</h2>
                        <p className="text-xs text-indigo-200 mt-0.5">
                            This creates a pending entry — customer can then pay from the payment screen.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">

                        {/* Month + Due Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Month Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={activeEnrollment?.totalMonths ?? 99}
                                    required
                                    value={monthNumber}
                                    onChange={(e) => {
                                        setMonthNumber(e.target.value);
                                        setRemarks(`Month ${e.target.value} collection entry`);
                                    }}
                                    placeholder="e.g. 1"
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                                {activeEnrollment && (
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Plan has {activeEnrollment.totalMonths} months total
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Due Date <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                            </div>
                        </div>

                        {/* Due Amount */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Due Amount (₹) <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    required
                                    value={dueAmount}
                                    onChange={(e) => setDueAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 font-semibold"
                                />
                            </div>
                            {activeEnrollment?.monthlyAmount && (
                                <button
                                    type="button"
                                    onClick={() => setDueAmount(String(activeEnrollment.monthlyAmount))}
                                    className="text-[10px] text-indigo-500 hover:underline mt-1 font-semibold"
                                >
                                    Use plan amount: {fmt(activeEnrollment.monthlyAmount)}
                                </button>
                            )}
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Remarks
                            </label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="e.g. Month 1 collection entry"
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
                            />
                        </div>

                        {/* Payload preview — helps agent confirm before sending */}
                        {activeEnrollment && monthNumber && dueAmount && (
                            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-3 space-y-1.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Will send to backend
                                </p>
                                {[
                                    ["enrollmentId", selectedId],
                                    ["monthNumber", monthNumber],
                                    ["dueDate", dueDate],
                                    ["dueAmount", `₹${dueAmount}`],
                                    ["remarks", remarks || "—"],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-mono">{k}</span>
                                        <span className="text-gray-700 font-semibold">{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}


                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !activeEnrollment || !monthNumber || !dueAmount || !dueDate}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all
                ${submitting || !activeEnrollment || !monthNumber || !dueAmount || !dueDate
                                    ? "bg-indigo-300 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-md"}`}
                        >
                            {submitting ? (
                                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating Entry...</>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Collection Entry
                                </>
                            )}
                        </button>

                    </form>
                </div>

                {/* ── Info box ── */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
                    <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-amber-700">
                        <span className="font-bold">How this works:</span> After enrollment, create one entry per month here.
                        Each entry appears as <span className="font-semibold">PENDING</span> on the payment screen.
                        When the agent collects payment, it marks the entry as <span className="font-semibold">PAID</span>.
                    </p>
                </div>

            </div>
        </div>
    );
}