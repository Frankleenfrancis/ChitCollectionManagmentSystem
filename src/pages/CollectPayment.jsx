import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { chitCollectionApi } from "../api/chitCollectionApi";


export default function CollectPayment() {


    const navigate = useNavigate();


    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [collection, setCollection] = useState(null);

    const [paymentMode, setPaymentMode] = useState("CASH");
    const [referenceNo, setReferenceNo] = useState("");
    const [notes, setNotes] = useState("");

    const { customerId } = useParams();
    console.log("Customer ID:", customerId);

    useEffect(() => {
        if (customerId) {
            loadPendingCollection();
        }
    }, [customerId]);

    const loadPendingCollection = async () => {
        try {
            setLoading(true);

            console.log(
                "Calling API for customer:",
                customerId
            );

            const data =
                await chitCollectionApi.getPendingCollections(
                    customerId
                );

            console.log("API Response:", data);

            setCollection(
                Array.isArray(data)
                    ? data[0]
                    : data
            );
        } catch (err) {
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    }

    const handlePayment = async () => {
        try {
            setSaving(true);

            const payload = {
                transactionReference: referenceNo,
                enrollmentId: collection.enrollmentId,
                monthNumber: collection.monthNumber,
                dueDate: collection.dueDate,
                dueAmount: collection.dueAmount,
                paidAmount: collection.balanceAmount,
                paymentMode,
                remarks: notes,
                paymentDate: new Date().toISOString(),
            };

            console.log("Submitting Payload:", payload);

            const receipt =
                await chitCollectionApi.createCollectionEntry(
                    payload
                );

            alert("Payment collected successfully");

            navigate("/admin/dashboard/customers");
        } catch (err) {
            console.error("Status:", err.response?.status);
            console.error("Response:", err.response?.data);
            alert("Payment Failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center">
                Loading...
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="p-10 text-center">
                No pending collection found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-6"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="bg-white rounded-3xl shadow overflow-hidden">

                    <div className="bg-blue-50 p-6 flex justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-600">
                                CUSTOMER NAME
                            </p>

                            <h2 className="text-3xl font-bold text-blue-900">
                                {collection.customerName}
                            </h2>

                            <p className="text-gray-600">
                                {collection.customerPhone}
                            </p>

                            <p className="text-sm text-gray-500 mt-2">
                                ID: #{collection.customerId}
                            </p>

                            <p className="text-sm text-gray-500">
                                Month: {collection.monthNumber}
                            </p>

                            <p className="text-sm text-gray-500">
                                {collection.chitPlanName}
                            </p>
                        </div>

                        <div className="bg-white border rounded-xl p-4">
                            <p className="text-xs text-gray-500">
                                DUE AMOUNT
                            </p>

                            <p className="text-3xl font-bold">
                                ₹ {collection.balanceAmount}
                            </p>
                        </div>
                    </div>

                    <div className="p-6">

                        <h3 className="font-semibold mb-4">
                            Select Payment Mode
                        </h3>

                        <div className="grid grid-cols-3 gap-3 mb-6">

                            <button
                                onClick={() => setPaymentMode("CASH")}
                                className={`border rounded-xl p-4 ${paymentMode === "CASH"
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                                    }`}
                            >
                                Cash
                            </button>

                            <button
                                onClick={() => setPaymentMode("UPI")}
                                className={`border rounded-xl p-4 ${paymentMode === "UPI"
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                                    }`}
                            >
                                UPI
                            </button>

                            <button
                                onClick={() => setPaymentMode("CHEQUE")}
                                className={`border rounded-xl p-4 ${paymentMode === "CHEQUE"
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                                    }`}
                            >
                                Cheque
                            </button>

                        </div>

                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium">
                                Transaction Reference
                            </label>

                            <input
                                value={referenceNo}
                                onChange={(e) =>
                                    setReferenceNo(e.target.value)
                                }
                                className="w-full border rounded-xl p-3"
                                placeholder="Reference Number"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-medium">
                                Remarks
                            </label>

                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) =>
                                    setNotes(e.target.value)
                                }
                                className="w-full border rounded-xl p-3"
                            />
                        </div>

                        <div className="border rounded-2xl p-5 mb-6 bg-gray-50">

                            <h4 className="font-semibold mb-4">
                                Collection Summary
                            </h4>

                            <div className="flex justify-between mb-2">
                                <span>Due Amount</span>
                                <span>
                                    ₹ {collection.dueAmount}
                                </span>
                            </div>

                            <div className="flex justify-between mb-2">
                                <span>Balance Amount</span>
                                <span>
                                    ₹ {collection.balanceAmount}
                                </span>
                            </div>

                            <div className="flex justify-between font-bold text-xl text-green-600">
                                <span>Total Amount</span>
                                <span>
                                    ₹ {collection.balanceAmount}
                                </span>
                            </div>

                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={saving}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {saving
                                ? "Processing..."
                                : "Confirm Collection"}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}