import { useState, useEffect, useMemo } from "react";
import { chitCollectionApi } from "../api/chitCollectionApi";
import { useAuth } from "../components/AuthContext";
import RecordCollectionForm from "./RecordCollectionForm";
import ChitEnrollment from "./ChitEnrollment";
import { useNavigate } from "react-router-dom";

export default function EnrollmentTracker({ onBack }) {
    const [showForm, setShowForm] = useState(false);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [collectionEntry, setCollectionEntry] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const navigate = useNavigate();

    const fetchActiveEnrollments = async () => {
        setLoading(true);
        try {
            const data = await chitCollectionApi.getAllEnrollments(0, 50);
            const list = Array.isArray(data) ? data : (data?.content || []);

  
            console.log("API Data Structure:", list[0]);

            setEnrollments(list);
        } catch (error) {
            console.error("Error loading:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => { fetchActiveEnrollments(); }, []);

    const filtered = enrollments.filter((e) => {
        const customerName = e.customerName || "";
        const groupName =
            e.groupName ||
            e.chitGroupName ||
            e.chitPlan?.name ||
            "";

        return (
            customerName.toLowerCase().includes(search.toLowerCase()) ||
            groupName.toLowerCase().includes(search.toLowerCase())
        );
    });


    const loadCollectionEntires = async () => {
        try {
            setLoading(true);

            let data;

            if (debouncedSearch.trim()) {
                data = await chitCollectionApi.search(
                    debouncedSearch,
                    page,
                    10
                );
            } else {
                data = await chitCollectionApi.getCollectionHistoryByCustomer(customerId);
            }
            console.log("API Response received:", data);
            console.log("Content length:", data.data?.content?.length);

            setCollectionEntry(data.content);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCollectionEntires();
    }, [page, debouncedSearch]);



    return (
        <div className="min-h-screen bg-gray-50 font-sans p-6 ">
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            ← Back
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900" >Collection Desk</h1>
                    <p className="text-sm text-gray-500">Record and monitor incoming monthly payments.</p>


                    <button
                        onClick={() => {
                            console.log("Button clicked");
                            setShowForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-3 "
                    >
                        + New Collection Entry
                    </button>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start pt-6">
                        {/* Main Panel: List View */}
                        <div className="xl:col-span-2 space-y-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <input
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Search by customer name or group..."
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>


                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-500">
                                        Loading collections...
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Participant</th>
                                                <th className="px-6 py-4 text-left">Group</th>
                                                <th className="px-6 py-4 text-right">Due Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filtered.map((e) => (
                                                <tr
                                                    key={e.id}
                                                    className="hover:bg-blue-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-800">
                                                        {e.customerName}
                                                    </td>

                                                    <td className="px-6 py-4 text-gray-600">
                                                        {e.chitPlanName}
                                                    </td>

                                                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                        ₹{Number(e.pendingAmount || 0).toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                )}
                            </div>

                        </div>

                    

                        {showForm && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-4">
                                        {/* <h2 className="text-lg font-bold">
                                            Record Collection
                                        </h2> */}


                                    </div>

                                    <RecordCollectionForm
                                        onSuccess={() => {
                                            fetchActiveEnrollments();
                                            setShowForm(false);
                                        }}
                                        onBack={() => setShowForm(false)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}