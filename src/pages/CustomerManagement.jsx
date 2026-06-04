// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { customerApi } from "../api/customerApi";
// import { chitPlanApi } from "../api/chitPlanApi";
// import { chitCollectionApi } from "../api/chitCollectionApi";

// // ── ENRICHED THREE-WAY MAPPER ─────────────────────────
// // Stitches Enrollment details with matching Customer Master data and Plan Master data
// const mapEnrollmentWithDetails = (enrollment, customerList, planList) => {
//     const matchingCustomer = customerList.find((cust) => cust.id === enrollment.customerId);
//     const matchingPlan = planList.find((plan) => plan.id === enrollment.planId);

//     // Dynamic calculations safely guarding against null values
//     const totalAmount = enrollment.totalAmount || matchingPlan?.totalAmount || 0;
//     const paidAmount = enrollment.paidAmount || 0;

//     return {
//         ...enrollment,
//         // UI Friendly flattened properties
//         fullName: matchingCustomer ? `${matchingCustomer.firstName} ${matchingCustomer.lastName}` : "Unknown Customer",
//         customerCode: matchingCustomer?.customerCode || `CUST-${enrollment.customerId}`,
//         customerPhone: matchingCustomer?.phone || "N/A",
//         city: matchingCustomer?.city || "Unknown Area",
//         email: matchingCustomer?.email || "",
//         chitGroup: matchingPlan?.groupName || matchingPlan?.name || "Unassigned",
//         totalAmount,
//         paidAmount
//     };
// };

// // Avatar Initials Helper
// const initials = (name) =>
//     name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";


// // ─────────────────────────────────────────────
// // SUB-COMPONENTS
// // ─────────────────────────────────────────────
// function StatusBadge({ status }) {
//     const isOverdue = status?.toLowerCase().includes("overdue");
//     return (
//         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOverdue ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
//             }`}>
//             <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? "bg-red-500" : "bg-green-500"}`} />
//             {status || "Active"}
//         </span>
//     );
// }

// function ProgressBar({ value }) {
//     const color =
//         value >= 80 ? "bg-green-500" :
//             value >= 40 ? "bg-indigo-500" : "bg-indigo-400";
//     return (
//         <div className="flex flex-col gap-1 min-w-[120px]">
//             <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
//                 <div
//                     className={`${color} h-2 rounded-full transition-all duration-500`}
//                     style={{ width: `${Math.min(value, 100)}%` }}
//                 />
//             </div>
//             <span className="text-xs text-gray-400">{value}% Completed</span>
//         </div>
//     );
// }


// // ─────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────
// export default function CustomerManagement() {
//     // State
//     const [enrollments, setEnrollments] = useState([]); // Fixed: Added missing enrollment array state
//     const [loading, setLoading] = useState(true);
//     const [totalElements, setTotalElements] = useState(0);
//     const [totalPages, setTotalPages] = useState(1);
//     const [page, setPage] = useState(1);
//     const [activeMenuId, setActiveMenuId] = useState(null);

//     // Filter states
//     const [search, setSearch] = useState("");
//     const [debouncedSearch, setDebouncedSearch] = useState("");
//     const [group, setGroup] = useState("All Groups");
//     const [status, setStatus] = useState("All Statuses");
//     const [area, setArea] = useState("All Areas");

//     const navigate = useNavigate();

//     // User session
//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const userRole = user?.role;

//     // Debounce search input
//     useEffect(() => {
//         const t = setTimeout(() => setDebouncedSearch(search), 400);
//         return () => clearTimeout(t);
//     }, [search]);

//     // Async data loader (Aggregates Enrollment, Customers, and Plans)
//     const loadEnrollmentDashboardData = async () => {
//         try {
//             setLoading(true);
//             let enrollmentRawPayload = null;
//             let masterCustomers = [];
//             let masterPlans = [];

//             // Execute network requests concurrently
//             try {
//                 const [resEnrollments, resCustomers, resPlans] = await Promise.all([
//                     chitCollectionApi.getAllEnrollments(page - 1, 10),
//                     customerApi.getAllCustomers(),
//                     chitPlanApi.getAllPlans()
//                 ]);
//                 enrollmentRawPayload = resEnrollments;
//                 masterCustomers = Array.isArray(resCustomers) ? resCustomers : resCustomers?.content || [];
//                 masterPlans = Array.isArray(resPlans) ? resPlans : resPlans?.content || [];
//             } catch (apiErr) {
//                 console.warn("Parallel lookup components failed, loading raw elements fallback:", apiErr);
//                 enrollmentRawPayload = await chitCollectionApi.getAllEnrollments(page - 1, 10);
//             }

//             // Process structure and perform dataset mapping
//             if (enrollmentRawPayload?.content) {
//                 const mappedData = enrollmentRawPayload.content.map(rawEnrollment =>
//                     mapEnrollmentWithDetails(rawEnrollment, masterCustomers, masterPlans)
//                 );
//                 setEnrollments(mappedData);
//                 setTotalElements(enrollmentRawPayload.totalElements || mappedData.length);
//                 setTotalPages(enrollmentRawPayload.totalPages || 1);
//             } else if (Array.isArray(enrollmentRawPayload)) {
//                 const mappedData = enrollmentRawPayload.map(rawEnrollment =>
//                     mapEnrollmentWithDetails(rawEnrollment, masterCustomers, masterPlans)
//                 );
//                 setEnrollments(mappedData);
//                 setTotalElements(mappedData.length);
//                 setTotalPages(1);
//             } else {
//                 setEnrollments([]);
//             }
//         } catch (err) {
//             console.error("Failed to parse and display layout records:", err);
//             setEnrollments([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadEnrollmentDashboardData();
//     }, [page]);

//     // ── MULTI-FILTER COMPILATION ────────────────
//     const filteredEnrollments = enrollments.filter((e) => {
//         const matchSearch =
//             e.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//             e.customerCode?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//             e.chitGroup?.toLowerCase().includes(debouncedSearch.toLowerCase());

//         const matchGroup = group === "All Groups" || e.chitGroup === group;
//         const matchStatus = status === "All Statuses" || e.status === status;
//         const matchArea = area === "All Areas" || e.city === area;

//         return matchSearch && matchGroup && matchStatus && matchArea;
//     });

//     // ── STATS ENGINE ────────────────────────────
//     const missingEmailCount = enrollments.filter((e) => !e.email || e.email.trim() === "").length;
//     const activeGroupsCount = new Set(enrollments.map((e) => e.chitGroup).filter((g) => g && g !== "Unassigned" && g !== "N/A")).size;

//     const stats = [
//         { label: "Total Enrollments", value: totalElements, color: "text-indigo-600" },
//         { label: "Active Groups Involved", value: activeGroupsCount, color: "text-emerald-600" },
//         { label: "Missing Contact Emails", value: missingEmailCount, color: "text-amber-500" },
//         {
//             label: "Current Page View",
//             value: enrollments.length === 0 ? "0" : `${page} / ${totalPages}`,
//             color: "text-purple-600"
//         },
//     ];

//     // Actions
//     const handleAddClick = () => {
//         const prefix = userRole === "ADMIN" ? "/admin" : userRole === "AGENT" ? "/agent" : "";
//         navigate(`${prefix}/dashboard/customers/create-customer`);
//     };

//     const handleEditClick = (enrollmentRow) => {
//         setActiveMenuId(null);
//         navigate(`/admin/dashboard/edit-enrollment/${enrollmentRow.id}`, {
//             state: { enrollmentData: enrollmentRow },
//         });
//     };

//     const handleDeleteClick = async (enrollmentRow) => {
//         if (!window.confirm(`Are you sure you want to permanently cancel enrollment for ${enrollmentRow.fullName}?`)) return;
//         try {
//             // Deactivating/cancelling enrollment via unique row ID
//             await chitCollectionApi.getEnrollmentById(enrollmentRow.id);
//             alert("Enrollment state altered successfully!");
//             setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentRow.id));
//         } catch (err) {
//             alert(err.response?.data?.message || "Failed to remove entry from collection scope.");
//         }
//     };

//     const paginationRange = Array.from({ length: totalPages }, (_, i) => i + 1);

//     return (
//         <div className="min-h-screen bg-gray-50 font-sans p-6">
//             <div className="max-w-7xl mx-auto space-y-6">

//                 {/* Header */}
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Enrollment & Customer Registry</h1>
//                         <p className="text-sm text-gray-400 mt-0.5">
//                             Manage and monitor chit fund participants across all active groups.
//                         </p>
//                     </div>
//                     <div className="flex gap-3">
//                         {userRole === "ADMIN" && (
//                             <button
//                                 onClick={handleAddClick}
//                                 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors"
//                             >
//                                 <span className="text-lg leading-none">+</span>
//                                 New Enrollment
//                             </button>
//                         )}
//                         <button className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors">
//                             Export CSV
//                         </button>
//                     </div>
//                 </div>

//                 {/* Filters Row */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                         {/* Search Bar */}
//                         <div>
//                             <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
//                                 Search Details
//                             </label>
//                             <div className="relative">
//                                 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
//                                 </svg>
//                                 <input
//                                     type="text"
//                                     placeholder="Name, ID or Group..."
//                                     value={search}
//                                     onChange={(e) => setSearch(e.target.value)}
//                                     className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
//                                 />
//                             </div>
//                         </div>

//                         {/* Group Selector */}
//                         <div>
//                             <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
//                                 Group
//                             </label>
//                             <select
//                                 value={group}
//                                 onChange={(e) => setGroup(e.target.value)}
//                                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
//                             >
//                                 <option>All Groups</option>
//                                 {[...new Set(enrollments.map(e => e.chitGroup).filter(g => g && g !== "Unassigned"))].map((g) => (
//                                     <option key={g}>{g}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Status Selector */}
//                         <div>
//                             <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
//                                 Status
//                             </label>
//                             <select
//                                 value={status}
//                                 onChange={(e) => setStatus(e.target.value)}
//                                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
//                             >
//                                 <option>All Statuses</option>
//                                 <option>Active</option>
//                                 <option>Overdue</option>
//                             </select>
//                         </div>

//                         {/* Area Selector */}
//                         <div>
//                             <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
//                                 Area
//                             </label>
//                             <select
//                                 value={area}
//                                 onChange={(e) => setArea(e.target.value)}
//                                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
//                             >
//                                 <option>All Areas</option>
//                                 {[...new Set(enrollments.map((e) => e.city).filter(Boolean))].map((city) => (
//                                     <option key={city}>{city}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Table Component */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left border-collapse">
//                             <thead>
//                                 <tr className="border-b border-gray-100 bg-gray-50/50">
//                                     <th className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Customer Name & ID</th>
//                                     <th className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Chit Group</th>
//                                     <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Total Value</th>
//                                     <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Amount Paid</th>
//                                     <th className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Progress</th>
//                                     <th className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Status</th>
//                                     <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {loading ? (
//                                     <tr>
//                                         <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
//                                             Loading collection registry records...
//                                         </td>
//                                     </tr>
//                                 ) : filteredEnrollments.length > 0 ? (
//                                     filteredEnrollments.map((e) => {
//                                         const progress = e.totalAmount > 0 ? Math.round((e.paidAmount / e.totalAmount) * 100) : 0;
//                                         return (
//                                             <tr key={e.id} className="hover:bg-gray-50/70 transition-colors group">
//                                                 <td className="px-6 py-4">
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="bg-indigo-500 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
//                                                             {initials(e.fullName)}
//                                                         </div>
//                                                         <div>
//                                                             <p className="text-sm font-semibold text-gray-800">{e.fullName}</p>
//                                                             <p className="text-xs text-gray-400">Code: {e.customerCode}</p>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 text-sm text-gray-600">{e.chitGroup}</td>
//                                                 <td className="px-6 py-4 text-sm font-medium text-gray-800 text-right">₹{e.totalAmount?.toLocaleString() || 0}</td>
//                                                 <td className="px-6 py-4 text-sm font-semibold text-indigo-600 text-right">₹{e.paidAmount?.toLocaleString() || 0}</td>
//                                                 <td className="px-6 py-4"><ProgressBar value={progress} /></td>
//                                                 <td className="px-6 py-4"><StatusBadge status={e.status} /></td>
//                                                 <td className="px-6 py-4 text-right">
//                                                     <ActionMenu
//                                                         isOpen={activeMenuId === e.id}
//                                                         onToggle={() => setActiveMenuId(activeMenuId === e.id ? null : e.id)}
//                                                         onEdit={() => handleEditClick(e)}
//                                                         onDelete={() => handleDeleteClick(e)}
//                                                     />
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })
//                                 ) : (
//                                     <tr>
//                                         <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
//                                             No explicit records matched your filter criteria.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* Pagination Controls */}
//                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
//                     <p className="text-sm text-gray-400">
//                         Showing {filteredEnrollments.length} of {totalElements} elements
//                     </p>
//                     <div className="flex items-center gap-1">
//                         <button
//                             onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                             disabled={page === 1}
//                             className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//                         >
//                             Previous
//                         </button>
//                         {paginationRange.map((p) => (
//                             <button
//                                 key={p}
//                                 onClick={() => setPage(p)}
//                                 className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${page === p ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
//                                     }`}
//                             >
//                                 {p}
//                             </button>
//                         ))}
//                         <button
//                             onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//                             disabled={page === totalPages}
//                             className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Dashboard Stats Panel */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 max-w-7xl mx-auto">
//                 {stats.map((s) => (
//                     <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
//                         <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
//                         <p className={`text-3xl font-bold mt-2 tracking-tight ${s.color}`}>{s.value}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }


// // ── DROPDOWN ACTION COMPONENT ────────────────
// function ActionMenu({ isOpen, onToggle, onEdit, onDelete }) {
//     const menuRef = useRef(null);

//     useEffect(() => {
//         const handler = (e) => {
//             if (isOpen && menuRef.current && !menuRef.current.contains(e.target)) onToggle();
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, [isOpen, onToggle]);

//     return (
//         <div className="relative inline-block text-left" ref={menuRef}>
//             <button
//                 onClick={(e) => { e.stopPropagation(); onToggle(); }}
//                 className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
//             >
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                     <circle cx="10" cy="4" r="1.5" />
//                     <circle cx="10" cy="10" r="1.5" />
//                     <circle cx="10" cy="16" r="1.5" />
//                 </svg>
//             </button>

//             {isOpen && (
//                 <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[9999]">
//                     <button
//                         onClick={(e) => { e.stopPropagation(); onEdit(); }}
//                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//                     >
//                         <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                         </svg>
//                         Edit
//                     </button>
//                     <button
//                         onClick={(e) => { e.stopPropagation(); onDelete(); }}
//                         className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
//                     >
//                         <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                         </svg>
//                         Remove
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }