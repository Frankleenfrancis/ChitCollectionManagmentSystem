import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { chitPlanApi } from "../api/chitPlanApi";
import toast from "react-hot-toast";

export default function EditChitPlan() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const preloadedPlan = location.state?.planData;

    const [form, setForm] = useState({
        planName: "",
        totalAmount: "",
        durationMonths: "",
        monthlyAmount: "",
        maxMembers: "",
        description: "",
        startDate: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);


    useEffect(() => {
        if (preloadedPlan) {
            setForm({
                planName: preloadedPlan.planName || "",
                totalAmount: preloadedPlan.totalAmount || "",
                durationMonths: preloadedPlan.durationMonths || "",
                monthlyAmount: preloadedPlan.monthlyAmount || "",
                maxMembers: preloadedPlan.maxMembers || "",
                description: preloadedPlan.description || preloadedPlan.descriptions || "",
                startDate: preloadedPlan.startDate ? preloadedPlan.startDate.split('T')[0] : ""
            });
        } else if (id) {
            const fetchFreshPlanData = async () => {
                try {
                    setLoading(true);
                    const response = await chitPlanApi.getById(id);

                    // Unwraps Java ApiResponse<T> success envelope safely if present
                    const freshData = response?.data || response;

                    if (freshData) {
                        setForm({
                            planName: freshData.planName || "",
                            totalAmount: freshData.totalAmount || "",
                            durationMonths: freshData.durationMonths || "",
                            monthlyAmount: freshData.monthlyAmount || "",
                            maxMembers: freshData.maxMembers || "",
                            description: freshData.description || freshData.descriptions || "",
                            startDate: freshData.startDate ? freshData.startDate.split('T')[0] : ""
                        });
                    }
                } catch (err) {
                    console.error("Direct fetch fallback failed:", err);
                    toast.error("Failed to recover chit plan details from database.");
                } finally {
                    setLoading(false);
                }
            };
            fetchFreshPlanData();
        }
    }, [id, preloadedPlan]);


    useEffect(() => {
        const total = Number(form.totalAmount);
        const duration = Number(form.durationMonths);

        if (total > 0 && duration > 0) {
            const calculatedAmount = Math.floor(total / duration);
            if (!isNaN(calculatedAmount) && isFinite(calculatedAmount)) {
                // Only update state if the value actually changed to prevent state thrashing
                if (form.monthlyAmount !== calculatedAmount.toString()) {
                    setForm(prev => ({
                        ...prev,
                        monthlyAmount: calculatedAmount.toString()
                    }));
                }
            }
        }
    }, [form.totalAmount, form.durationMonths, form.monthlyAmount]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const chitPlanPayload = {
            planName: form.planName,
            totalAmount: Number(form.totalAmount),
            durationMonths: Number(form.durationMonths),
            monthlyAmount: Number(form.monthlyAmount),
            maxMembers: Number(form.maxMembers),
            description: form.description,

            startDate: form.startDate
        };

        try {

            await chitPlanApi.update(id, chitPlanPayload);
            toast.success("Chit plan scheme updated successfully");
            navigate(-1);
        } catch (err) {
            console.error("Form transmission errors:", err);
            toast.error(err.response?.data?.message || "Failed to submit plan updates.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-sm animate-pulse">Syncing plan structure values...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">


                <div className="border-b pb-4 mb-6">
                    <h1 className="text-xl font-bold text-gray-900">📋 Edit Chit Plan Scheme</h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Modifying target scheme identifier: <span className="font-mono text-indigo-600 font-bold">#{id}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">


                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Plan Scheme Name *</label>
                        <input
                            type="text"
                            name="planName"
                            value={form.planName}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Premium 50k Mega Saver"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Total Chit Value (₹) *</label>
                            <input
                                type="number"
                                name="totalAmount"
                                value={form.totalAmount}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Scheme Duration (Months) *</label>
                            <input
                                type="number"
                                name="durationMonths"
                                value={form.durationMonths}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Calculated Monthly Installment (₹)</label>
                            <input
                                type="number"
                                name="monthlyAmount"
                                value={form.monthlyAmount}
                                disabled
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 text-gray-500 font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Maximum Members *</label>
                            <input
                                type="number"
                                name="maxMembers"
                                value={form.maxMembers}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Scheme Start Date *</label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Description *</label>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., Plan details"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Back / Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Saving Scheme Changes..." : "Update Plan Configuration"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}