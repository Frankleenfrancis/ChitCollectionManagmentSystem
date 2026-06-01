import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { chitPlanApi } from "../../api/chitPlanApi";
import CreateChitPlan from "./CreateChitPlan";
import toast from "react-hot-toast";
import EditChitPlan from "../../components/EditChitPlan";
import { useAuth } from "../../components/AuthContext";

export default function ChitPlanList() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDuration, setSelectedDuration] = useState("");

    const navigate = useNavigate();

    const { user } = useAuth();
    const userRole = user?.role;

    // Dynamic base route
    const basePath =
        userRole === "ADMIN"
            ? "/admin/dashboard"
            : userRole === "AGENT"
                ? "/agent/dashboard"
                : "/dashboard";

    // Load plans from database on mount
    const fetchPlans = async () => {
        try {
            setLoading(true);

            const data = await chitPlanApi.getAll(0, 50);

            setPlans(
                Array.isArray(data)
                    ? data
                    : data.content || []
            );
        } catch (error) {
            console.error(
                "Error fetching database records:",
                error
            );

            toast.error(
                "Failed to load plans from database."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // Extract unique durations dynamically
    const durationOptions = useMemo(() => {
        const durations = plans
            .map((plan) => plan.durationMonths)
            .filter(Boolean);

        return [...new Set(durations)].sort(
            (a, b) => a - b
        );
    }, [plans]);

    // Client-side filtering logic
    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const matchesSearch =
                plan.planName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                plan.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesDuration =
                selectedDuration === "" ||
                String(plan.durationMonths) ===
                selectedDuration;

            return (
                matchesSearch && matchesDuration
            );
        });
    }, [plans, searchTerm, selectedDuration]);

    // Handle delete
    const handleDelete = async (
        id,
        planName
    ) => {
        if (
            window.confirm(
                `Are you sure you want to permanently delete "${planName}"?`
            )
        ) {
            try {
                toast.loading(
                    "Removing schema record...",
                    { id: "delete-action" }
                );

                await chitPlanApi.delete(id);

                toast.success(
                    "Record dropped successfully.",
                    { id: "delete-action" }
                );

                setPlans((prev) =>
                    prev.filter(
                        (item) => item.id !== id
                    )
                );
            } catch (error) {
                console.error(
                    "Deletion failed:",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    "Failed to delete plan",
                    { id: "delete-action" }
                );
            }
        }
    };

    if (loading)
        return (
            <div className="p-8 text-center text-gray-500 animate-pulse">
                Loading database configurations...
            </div>
        );

    return (
        <div className="p-6 max-w-6xl mx-auto font-sans">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Active Chit Matrix Schemas
                    </h2>

                    <p className="text-xs text-gray-400">
                        Manage real-time ledger
                        allocations stored inside
                        the database.
                    </p>
                </div>

                <button
                    onClick={() =>
                        navigate(
                            `${basePath}/chits/create`
                        )
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors whitespace-nowrap"
                >
                    + Add New Scheme
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">

                {/* Search */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search by plan name or description..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                        className="w-full bg-white border border-gray-200 text-sm px-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-700 placeholder-gray-400"
                    />

                    {searchTerm && (
                        <button
                            onClick={() =>
                                setSearchTerm("")
                            }
                            className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Duration Filter */}
                <div className="w-full sm:w-48">
                    <select
                        value={selectedDuration}
                        onChange={(e) =>
                            setSelectedDuration(
                                e.target.value
                            )
                        }
                        className="w-full bg-white border border-gray-200 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-600"
                    >
                        <option value="">
                            All Durations
                        </option>

                        {durationOptions.map(
                            (duration) => (
                                <option
                                    key={duration}
                                    value={duration}
                                >
                                    {duration} Months
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                            <th className="p-4">
                                Plan Details
                            </th>

                            <th className="p-4">
                                Total Amount
                            </th>

                            <th className="p-4">
                                Duration
                            </th>

                            <th className="p-4">
                                Monthly Share
                            </th>

                            {/* 1. ADDED TABLE HEADER FOR INDIVIDUAL SHARE CAPACITY */}
                            <th className="p-4">
                                Per Member Share
                            </th>

                            <th className="p-4 text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {filteredPlans.length === 0 ? (
                            <tr>
                                {/* Updated colSpan from 5 to 6 to encompass new structural column */}
                                <td
                                    colSpan="6"
                                    className="p-8 text-center text-gray-400 text-xs"
                                >
                                    {plans.length === 0
                                        ? "No active plans found in DB."
                                        : "No plans match your search criteria."}
                                </td>
                            </tr>
                        ) : (
                            filteredPlans.map(
                                (plan) => {
                                    // 2. DYNAMIC CALCULATION: Calculate individual breakdown on the fly
                                    const monthlyAmountNum = parseFloat(plan.monthlyAmount) || 0;
                                    const maxMembersNum = parseInt(plan.maxMembers, 10) || 0;

                                    const perMemberAmt = (monthlyAmountNum > 0 && maxMembersNum > 0)
                                        ? Math.floor(monthlyAmountNum / maxMembersNum)
                                        : 0;

                                    return (
                                        <tr
                                            key={plan.id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <span className="font-semibold text-gray-900 block">
                                                    {plan.planName}
                                                </span>

                                                <span className="text-xs text-gray-400 line-clamp-1">
                                                    {plan.description}
                                                </span>
                                            </td>

                                            <td className="p-4 font-mono font-medium text-gray-900">
                                                ₹
                                                {plan.totalAmount?.toLocaleString()}
                                            </td>

                                            <td className="p-4">
                                                {plan.durationMonths} Mos
                                            </td>

                                            <td className="p-4 font-mono text-gray-500">
                                                ₹
                                                {plan.monthlyAmount?.toLocaleString()}
                                            </td>

                                            {/* 3. ADDED TABLE CELL WITH THE COMPUTED FRACTION */}
                                            <td className="p-4 font-mono font-semibold text-indigo-600">
                                                {perMemberAmt > 0 ? (
                                                    <>
                                                        ₹{perMemberAmt.toLocaleString()}
                                                        <span className="text-[10px] text-gray-400 font-normal block tracking-normal">
                                                            ({maxMembersNum} seats total)
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>

                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">

                                                    {/* Edit */}
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `${basePath}/chits/edit/${plan.id}`
                                                            )
                                                        }
                                                        className="px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                plan.id,
                                                                plan.planName
                                                            )
                                                        }
                                                        className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}