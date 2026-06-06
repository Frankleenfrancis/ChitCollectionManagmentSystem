// src/components/admin/CreateChitPlan.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { chitPlanApi } from "../../api/chitPlanApi";
import toast from "react-hot-toast";
import { useAuth } from "../../components/AuthContext";

export default function CreateChitPlan() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuth();
    const userRole = user?.role;


    const [formData, setFormData] = useState({
        planName: "",
        totalAmount: "",
        durationMonths: "",
        monthlyAmount: "",
        maxMembers: "",
        amountPerMember: "",
        description: "",
        startDate: "",
    });


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updated = { ...prev, [name]: value };


            if (name === "totalAmount" || name === "durationMonths" || name === "maxMembers") {
                const total = parseFloat(updated.totalAmount);
                const duration = parseInt(updated.durationMonths, 10);
                const membersCount = parseInt(updated.maxMembers, 10);


                if (total > 0 && duration > 0) {
                    const monthlyAmt = Math.floor(total / duration);
                    updated.monthlyAmount = monthlyAmt.toString();


                    if (membersCount > 0) {
                        updated.amountPerMember = Math.floor(monthlyAmt / membersCount).toString();
                    } else {
                        updated.amountPerMember = "";
                    }
                } else {

                    updated.monthlyAmount = "";
                    updated.amountPerMember = "";
                }
            }

            return updated;
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();


        if (submitting) return;


        if (!formData.planName.trim()) return toast.error("Please enter a Plan Name.");
        if (Number(formData.totalAmount) <= 0) return toast.error("Total amount must be greater than 0.");
        if (Number(formData.durationMonths) <= 0) return toast.error("Duration must be at least 1 month.");
        if (Number(formData.maxMembers) <= 0) return toast.error("Max members capacity must be greater than 0.");
        if (!formData.monthlyAmount || Number(formData.monthlyAmount) <= 0) {
            return toast.error("Invalid calculated monthly contribution.");
        }

        try {
            setSubmitting(true);
            toast.loading("Writing new chit scheme to database...", { id: "create-chit" });


            const payload = {
                planName: formData.planName.trim(),
                totalAmount: parseFloat(formData.totalAmount),
                durationMonths: parseInt(formData.durationMonths, 10),
                monthlyAmount: parseFloat(formData.monthlyAmount),
                maxMembers: parseInt(formData.maxMembers, 10),

                description: formData.description.trim(),
                startDate: formData.startDate,
            };

            console.log("Sending clean payload to Spring Boot backend:", JSON.stringify(payload, null, 2));

            await chitPlanApi.create(payload);

            toast.success("New Chit Plan successfully saved in DB!", { id: "create-chit" });

            if (userRole === "ADMIN") {
                navigate("/admin/dashboard/chits", { replace: true });
            } else {
                navigate("/agent/dashboard/chits", { replace: true });
            }

        } catch (error) {
            console.error("Database persistence failure:", error);

            const errorData = error.response?.data;
            let errorMsg = "Internal database sync error occurred.";

            if (typeof errorData === "string") {
                errorMsg = errorData;
            } else if (errorData?.message) {
                errorMsg = errorData.message;
            } else if (errorData?.errors && Array.isArray(errorData.errors)) {
                errorMsg = errorData.errors.map(err => `${err.field}: ${err.defaultMessage}`).join(" | ");
            }

            toast.error(errorMsg, { id: "create-chit", duration: 6000 });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">


                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Launch New Chit Plan</h2>
                    <p className="text-xs text-gray-400 mt-1">
                        Establish a brand new matrix pool schema inside the persistent system database ledger.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">


                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Plan Designation / Name (Unique)
                        </label>
                        <input
                            type="text"
                            name="planName"
                            value={formData.planName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="e.g. Gold Plan 12 Months"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Total Amount Value (₹)
                            </label>
                            <input
                                type="number"
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="120000"
                                required
                            />
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Lifecycle Duration (Months)
                            </label>
                            <input
                                type="number"
                                name="durationMonths"
                                value={formData.durationMonths}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="12"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Calculated Monthly Installment (₹)
                            </label>
                            <input
                                type="number"
                                name="monthlyAmount"
                                value={formData.monthlyAmount}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-gray-100 font-medium text-gray-600 cursor-not-allowed"
                                placeholder="Auto-calculated value"
                                required
                            />
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Max Structural Member Capacity
                            </label>
                            <input
                                type="number"
                                name="maxMembers"
                                value={formData.maxMembers}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="30"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Estimated Installment Per Member (₹)
                            </label>
                            <input
                                type="number"
                                name="amountPerMember"
                                value={formData.amountPerMember}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-indigo-50/50 font-semibold text-indigo-700 cursor-not-allowed"
                                placeholder="Awaiting capacity fields..."
                            />
                        </div>


                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Activation Cycle Launch Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
                                required
                            />
                        </div>
                    </div>


                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Plan Terms Summary Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="Write structural rules, auction parameters..."
                        />
                    </div>


                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/dashboard/chits")}
                            disabled={submitting}
                            className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-sm transition-colors disabled:opacity-60"
                        >
                            {submitting ? "Pushing to Database..." : "Commit Scheme to DB"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}