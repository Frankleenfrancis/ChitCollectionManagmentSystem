// src/pages/CollectPaymentPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chitPlanApi } from "../api/chitPlanApi";
import { paymentApi } from "../api/paymentApi";
import { customerApi } from "../api/customerApi";
import { chitCollectionApi } from "../api/chitCollectionApi";
import { Phone } from "lucide-react";
import { useAuth } from "../components/AuthContext";

const PAYMENT_MODES = [
    {
        id: "CASH", label: "Cash",
        icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /><path d="M6 12h.01M18 12h.01" strokeWidth={2} strokeLinecap="round" /></svg>),
    },
    {
        id: "UPI", label: "UPI",
        icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={1.5} /><path d="M9 18h6" strokeWidth={1.5} strokeLinecap="round" /></svg>),
    },
    {
        id: "CHEQUE", label: "Cheque",
        icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={1.5} /><path d="M7 9h5M7 12h8M7 15h4" strokeWidth={1.5} strokeLinecap="round" /></svg>),
    },
    {
        id: "ONLINE", label: "Online",
        icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" strokeWidth={1.5} /><line x1="1" y1="10" x2="23" y2="10" strokeWidth={1.5} /></svg>),
    },
];

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function ReceiptView({ receipt, onBack }) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                            onClick={() => navigate("/admin/dashboard")}
                            className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Receipt Generated!</h2>
                    <p className="text-sm text-gray-400 mt-1">Payment collected successfully</p>
                </div>

                {/* Receipt details */}
                <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm mb-5">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Receipt No.</span>
                        <span className="font-mono font-semibold text-gray-800">{receipt.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Customer</span>
                        <span className="font-semibold text-gray-800">{receipt.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Chit Plan</span>
                        <span className="font-medium text-gray-700">{receipt.chitPlanName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Month #</span>
                        <span className="font-medium text-gray-700">{receipt.monthNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Payment Mode</span>
                        <span className="font-medium text-gray-700">{receipt.paymentMode || "CASH"}</span>
                    </div>
                    {receipt.transactionReference && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ref ID</span>
                            <span className="font-mono text-gray-700">{receipt.transactionReference}</span>
                        </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-800">Amount Paid</span>
                        <span className="text-xl font-bold text-green-600">{fmt(receipt.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Total Paid Till Date</span>
                        <span className="text-indigo-600 font-semibold">{fmt(receipt.totalPaidTillDate)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Remaining Balance</span>
                        <span className="text-orange-500 font-semibold">{fmt(receipt.totalPendingAmount)}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                    </button>
                    <button onClick={onBack} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
                        New Payment
                    </button>
                </div>
            </div>
        </div >
    );
}

export default function Payment() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=find customer, 2=select entry, 3=pay
    const [phoneSearch, setPhoneSearch] = useState("");
    const [customer, setCustomer] = useState(null);
    const [pendingEntries, setPendingEntries] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [txnId, setTxnId] = useState("");
    const [notes, setNotes] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [amountPaid, setAmountPaid] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [err, setErr] = useState("");

    const { user, logout, isAdmin } = useAuth();

    const requiresTxnId = paymentMode === "UPI" || paymentMode === "CHEQUE" || paymentMode === "ONLINE";

    const handleSearchCustomer = async (e) => {
        e.preventDefault();
        if (!phoneSearch.trim()) return;
        setSearchLoading(true);
        setErr("");
        try {
            const c = await customerApi.getByPhone(phoneSearch.trim());
            setCustomer(c);

            const entries = await chitCollectionApi.getPendingCollections(c.id);
            setPendingEntries(entries);
            setStep(2);
        } catch (e) {
            setErr(e.response?.data?.message || "Customer not found with that phone number.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectEntry = (entry) => {
        setSelectedEntry(entry);
        setAmountPaid(String(entry.balanceAmount || entry.dueAmount));
        setStep(3);
    };

    const handleConfirm = async () => {
        if (requiresTxnId && !txnId.trim()) return;
        if (!amountPaid || isNaN(amountPaid)) return;
        setSubmitting(true);
        setErr("");
        try {
            const rec = await paymentApi.recordPayment({
                collectionEntryId: selectedEntry.id,
                amountPaid: parseFloat(amountPaid),
                paymentDate,
                paymentMode,
                transactionReference: txnId || null,
                remarks: notes || null,
            });
            setReceipt(rec);
        } catch (e) {
            setErr(e.response?.data?.message || "Failed to record payment.");
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setStep(1); setCustomer(null); setPendingEntries([]); setSelectedEntry(null);
        setPhoneSearch(""); setTxnId(""); setNotes(""); setPaymentMode("CASH");
        setAmountPaid(""); setReceipt(null); setErr("");
        setPaymentDate(new Date().toISOString().split("T")[0]);
    };

    if (receipt) return <ReceiptView receipt={receipt} onBack={reset} />;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Top Nav */}
            <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    {isAdmin ? (
                        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/admin/dashboard")} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : (
                        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/user/dashboard")} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <h1 className="text-base font-bold text-gray-900">Collect Payment</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`w-6 h-1.5 rounded-full transition-colors ${step >= s ? "bg-blue-600" : "bg-gray-200"}`} />
                        ))}
                    </div>
                    <span className="text-sm text-gray-400 font-medium">Step {step}/3</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-5 py-5 gap-4">
                {err && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                        {err}
                    </div>
                )}

                {/*Customer */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-6 space-y-5">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Find Customer</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Search by phone number to load pending collections</p>
                        </div>
                        <form onSubmit={handleSearchCustomer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit phone number"
                                    value={phoneSearch}
                                    onChange={(e) => setPhoneSearch(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searchLoading || !phoneSearch.trim()}
                                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {searchLoading ? "Searching..." : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                                        Find Customer
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Pending Entry */}
                {step === 2 && customer && (
                    <>
                        {/* Customer Card */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-0.5">Customer</p>
                                <p className="text-xl font-bold text-blue-800">{customer.fullName}</p>
                                <p className="text-xs text-blue-400 mt-0.5">ID: #{customer.id} • {customer.phone}</p>
                            </div>
                            <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 text-right shadow-sm">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Pending</p>
                                <p className="text-xl font-bold text-orange-500 mt-0.5">{fmt(customer.totalPending)}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 space-y-3">
                            <h2 className="text-sm font-bold text-gray-800">Select Collection Entry to Pay</h2>
                            {pendingEntries.length === 0 ? (
                                <div className="text-center py-8 text-sm text-gray-400">
                                    No pending collection entries for this customer.
                                </div>
                            ) : (
                                pendingEntries.map((entry) => (
                                    <button
                                        key={entry.id}
                                        onClick={() => handleSelectEntry(entry)}
                                        className="w-full flex items-center justify-between bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl px-4 py-3.5 transition-all text-left"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{entry.chitPlanName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Month #{entry.monthNumber} • Due: {entry.dueDate}</p>
                                            {entry.paidAmount > 0 && (
                                                <p className="text-xs text-green-600 mt-0.5">Partially paid: {fmt(entry.paidAmount)}</p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className="text-sm font-bold text-orange-500">{fmt(entry.balanceAmount)}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>
                                                {entry.status}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Payment Form */}
                {step === 3 && selectedEntry && customer && (
                    <>
                        {/* Customer Card */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-0.5">Customer Name</p>
                                <p className="text-xl font-bold text-blue-800">{customer.fullName}</p>
                                <p className="text-xs text-blue-400 mt-0.5">Policy: {selectedEntry.chitPlanName} – Month #{selectedEntry.monthNumber}</p>
                            </div>
                            <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 text-right shadow-sm">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Amount</p>
                                <p className="text-xl font-bold text-gray-900 mt-0.5">{fmt(selectedEntry.balanceAmount)}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 space-y-4">
                            <h2 className="text-sm font-bold text-gray-800">Select Payment Mode</h2>
                            <div className="grid grid-cols-4 gap-2">
                                {PAYMENT_MODES.map((mode) => {
                                    const selected = paymentMode === mode.id;
                                    return (
                                        <button
                                            key={mode.id}
                                            onClick={() => setPaymentMode(mode.id)}
                                            className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all text-xs font-medium ${selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
                                        >
                                            <span className={selected ? "text-blue-500" : "text-gray-300"}>{mode.icon}</span>
                                            {mode.label}
                                        </button>
                                    );
                                })}
                            </div>

                       
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount to Collect (₹)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedEntry.balanceAmount}
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <p className="text-xs text-gray-400 mt-1">Max: {fmt(selectedEntry.balanceAmount)}</p>
                            </div>

                      
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Date</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Transaction ID / Reference Number
                                    {requiresTxnId && <span className="text-red-400 ml-1">*</span>}
                                </label>
                                <input
                                    type="text"
                                    placeholder={requiresTxnId ? "Required for this payment mode" : "Optional"}
                                    value={txnId}
                                    onChange={(e) => setTxnId(e.target.value)}
                                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300 ${requiresTxnId && !txnId.trim() ? "border-orange-200 focus:ring-orange-200" : "border-gray-200"}`}
                                />
                            </div>

                   
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
                                <textarea
                                    rows={3}
                                    placeholder="Add internal notes about this collection..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300 resize-none"
                                />
                            </div>

               
                            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Collection Summary</p>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Due Amount</span>
                                    <span className="font-medium text-gray-800">{fmt(selectedEntry.dueAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Already Paid</span>
                                    <span className="font-medium text-green-600">{fmt(selectedEntry.paidAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Collecting Now</span>
                                    <span className="font-medium text-blue-600">{fmt(parseFloat(amountPaid) || 0)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-800">Balance After Payment</span>
                                    <span className="text-lg font-bold text-orange-500">
                                        {fmt(Math.max(0, selectedEntry.balanceAmount - (parseFloat(amountPaid) || 0)))}
                                    </span>
                                </div>
                            </div>
                        </div>

           
                        <div className="space-y-3 pb-6">
                            <button
                                onClick={handleConfirm}
                                disabled={submitting || (requiresTxnId && !txnId.trim()) || !amountPaid}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-md ${submitting || (requiresTxnId && !txnId.trim()) || !amountPaid ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {submitting ? "Processing..." : "Confirm Collection & Generate Receipt"}
                            </button>
                            <button onClick={reset} className="w-full py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pb-4">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure Agent Transaction
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}