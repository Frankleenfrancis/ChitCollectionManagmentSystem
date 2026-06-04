import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chitPlanApi } from "../api/chitPlanApi";
import { customerApi } from "../api/customerApi";
import { chitCollectionApi } from "../api/chitCollectionApi"

export const useFormMetadataLoader = (setCustomers, setPlans, setErrorMessage, setLoading) => {
    const loadData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const [resCustomers, resPlans] = await Promise.all([
                customerApi.getAll(),
                chitPlanApi.getAll(),
            ]);

            const processedCustomers = Array.isArray(resCustomers)
                ? resCustomers
                : resCustomers?.content || resCustomers?.data || [];

            const processedPlans = Array.isArray(resPlans)
                ? resPlans
                : resPlans?.content || resPlans?.data || [];

            setCustomers(processedCustomers);
            setPlans(processedPlans);
        } catch (err) {
            console.error("Critical lookup ingestion exception caught:", err);
            setErrorMessage("System failed to populate customer profiles or structural plan alternatives.");
        } finally {
            setLoading(false);
        }
    };

    return loadData;
};

export default function ChitEnrollment() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [plans, setPlans] = useState([]);


    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        customerId: "",
        planId: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
    });


    const loadData = useFormMetadataLoader(setCustomers, setPlans, setErrorMessage, setLoading);

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name.endsWith("Id") ? (value === "" ? "" : Number(value)) : value,
        }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");

        if (
            !formData.customerId ||
            !formData.planId ||
            !formData.enrollmentDate
        ) {
            setErrorMessage(
                "Please complete all mandatory fields."
            );
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                customerId: Number(formData.customerId),
                chitPlanId: Number(formData.planId),
                enrollmentDate: formData.enrollmentDate,
            };

            console.log("Enrollment Payload:", payload);

            await chitCollectionApi.enrollCustomer(payload);

            alert("Customer successfully enrolled into Chit Scheme!");

            // Reset form after success
            setFormData({
                customerId: "",
                planId: "",
                enrollmentDate: new Date()
                    .toISOString()
                    .split("T")[0],
            });

        } catch (err) {
            console.error("Enrollment Error:", err);

            setErrorMessage(
                err?.response?.data?.message ||
                "Customer enrollment failed."
            );
        } finally {
            setSubmitting(false);
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-500 font-sans">
                <p className="animate-pulse">Compiling layout master fields, please wait...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-6 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-lg p-6 space-y-6">

                {/* Header */}
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
                        className="mt-1 flex items-center justify-center p-2.5 border border-gray-200 bg-white hover:bg-gray-50 hover:text-indigo-600 text-gray-500 rounded-xl shadow-sm transition-colors"
                        title="Go to Dashboard Home"
                    >
                        <span className="text-base leading-none">⬅️</span>
                    </button>
                </div>

                <h2 className="text-xl font-bold text-gray-900">New Chit Enrollment</h2>
                <span>
                    <p className="text-xs text-gray-400">
                        Link an existing customer record to a designated operational chit subscription group.
                    </p>
                </span>

                {errorMessage && (
                    <div className="bg-red-50 text-red-600 text-xs font-medium px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Customer Selection Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Select Customer <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                        >
                            <option value="">-- Choose Profile --</option>

                            {customers.map((customer) => (
                                <option
                                    key={customer.id}
                                    value={customer.id}
                                >
                                    {customer.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Chit Plan Selection Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Assigned Chit Plan / Group <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="planId"
                            value={formData.planId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                        >
                            <option value="">
                                -- Choose Scheme Value --
                            </option>

                            {plans.map((plan) => (
                                <option
                                    key={plan.id}
                                    value={plan.id}
                                >
                                    {plan.planName} - ₹
                                    {Number(plan.totalAmount || 0).toLocaleString("en-IN")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Input Entry Component */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Enrollment Matrix Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="enrollmentDate"
                            value={formData.enrollmentDate}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
                        />
                    </div>

                    {/* Action Panel Buttons Layout */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            {submitting ? "Processing Entry..." : "Submit Enrollment"}
                        </button>
                    </div>

                </form>
            </div>
        </div >

    );
}

