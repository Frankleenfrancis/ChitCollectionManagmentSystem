import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { customerApi } from "../api/customerApi";
import toast from "react-hot-toast";

export default function EditCustomer() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();


    const preloadedCustomer = location.state?.customerData;

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        groupName: "",
        status: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (preloadedCustomer) {

            setForm({
                fullName: preloadedCustomer.fullName || "",
                phone: preloadedCustomer.phone || "",
                email: preloadedCustomer.email || "",
                address: preloadedCustomer.address || "",
                city: preloadedCustomer.city || "",
                groupName: preloadedCustomer.groupName || "",
                status: preloadedCustomer.status || "Up-to-date"
            });
        } else if (id) {

            const fetchFreshData = async () => {
                try {
                    setLoading(true);
                    const freshData = await customerApi.getById(id);
                    if (freshData) {
                        setForm({
                            fullName: freshData.fullName || "",
                            phone: freshData.phone || "",
                            email: freshData.email || "",
                            address: freshData.address || "",
                            city: freshData.city || "",
                            groupName: freshData.groupName || "",
                            status: freshData.status || "Up-to-date"
                        });
                    }
                } catch (err) {
                    console.error("Direct fetch fallback failed:", err);
                    toast.error("Failed to recover customer details from database.");
                } finally {
                    setLoading(false);
                }
            };
            fetchFreshData();
        }
    }, [id, preloadedCustomer]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const customerRequestPayload = {
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            address: form.address,
            city: form.city
        };

        try {

            await customerApi.update(id, customerRequestPayload);
            toast.success("Customer profile updated successfully");
            navigate(-1);
        } catch (err) {
            console.error("Form transmission errors:", err);

            toast.error(err.response?.data?.message || "Failed to submit updates.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-sm animate-pulse">Syncing profile record values...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">


                <div className="border-b pb-4 mb-6">
                    <h1 className="text-xl font-bold text-gray-900"> Edit Customer Profile</h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Updating record unique identifier: <span className="font-mono text-indigo-600 font-bold">#{id}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number *</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Current City</label>
                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Chit Group Assignment</label>
                            <input
                                type="text"
                                name="groupName"
                                value={form.groupName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 text-gray-500"
                                disabled // Group tracking should generally change via enrollment mutations, not profile text fields
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status Rule *</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
                            >
                                <option value="Up-to-date">Up-to-date</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Street Address *</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                        />
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
                            {submitting ? "Saving Changes..." : "Update Record"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}