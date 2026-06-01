// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { chitPlanApi } from "../api/chitPlanApi";
// import { customerApi } from "../api/customerApi";
// import { chitCollectionApi } from "../api/chitCollectionApi"

// export const useFormMetadataLoader = (setCustomers, setPlans, setErrorMessage, setLoading) => {
//     const loadData = async () => {
//         try {
//             setLoading(true);
//             setErrorMessage("");

//             const [resCustomers, resPlans] = await Promise.all([
//                 customerApi.getAll(),
//                 chitPlanApi.getAllPlans(),
//             ]);

//             const processedCustomers = Array.isArray(resCustomers)
//                 ? resCustomers
//                 : resCustomers?.content || resCustomers?.data || [];

//             const processedPlans = Array.isArray(resPlans)
//                 ? resPlans
//                 : resPlans?.content || resPlans?.data || [];

//             setCustomers(processedCustomers);
//             setPlans(processedPlans);
//         } catch (err) {
//             console.error("Critical lookup ingestion exception caught:", err);
//             setErrorMessage("System failed to populate customer profiles or structural plan alternatives.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return loadData;
// };

// export default function ChitEnrollment() {
//     const navigate = useNavigate();

//     const [phone, setPhone] = useState("");
//     const [selectedCustomer, setSelectedCustomer] = useState(null);

//     const [customers, setCustomers] = useState([]);
//     const [plans, setPlans] = useState([]);



//     // FIXED: Consolidated loading flags to prevent render locks
//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [errorMessage, setErrorMessage] = useState("");


//     const [formData, setFormData] = useState({
//         planId: "",
//         enrollmentDate: new Date().toISOString().split("T")[0],
//     });

//     const selectedPlan = plans.find(
//         (p) => Number(p.id) === Number(formData.planId)
//     );

//     const searchCustomerByPhone = async () => {
//         try {
//             setLoading(true);
//             setErrorMessage("");

//             const customer = await customerApi.getByPhone(phone);

//             if (!customer) {
//                 setErrorMessage("Customer not found");
//                 setSelectedCustomer(null);
//                 return;
//             }

//             setSelectedCustomer(customer);
//         } catch (err) {
//             setSelectedCustomer(null);
//             setErrorMessage(
//                 err.response?.data?.message ||
//                 "Customer not found"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     // FIXED: Correctly tracking errors via setErrorMessage instead of setError
//     const loadData = useFormMetadataLoader(setCustomers, setPlans, setErrorMessage, setLoading);

//     useEffect(() => {
//         loadData();
//     }, []);

//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         setFormData((prev) => ({
//             ...prev,
//             [name]: name.endsWith("Id") ? (value === "" ? "" : Number(value)) : value,
//         }));
//     };

//     const handleSubmit = async (e) => {

//         e.preventDefault();
//         setErrorMessage("");

//         const finalPayload = {
//             customerId: selectedCustomer.id,
//             chitPlanId: Number(formData.planId),
//             enrollmentDate: formData.enrollmentDate,
//             monthlyAmount: selectedPlan.monthlyAmount
//         };

//         if (!selectedCustomer || !formData.planId) {
//             setErrorMessage("Please search and select a customer");
//             return;
//         }

//         try {
//             setSubmitting(true);


//             await chitCollectionApi.enrollCustomer(finalPayload);

//             alert("Customer successfully enrolled into Chit Scheme!");
//             navigate(-1);
//         } catch (err) {
//             console.error("Submission layout exception caught:", err);
//             setErrorMessage(err.response?.data?.message || "Internal transmission network anomaly detected.");
//         } finally {
//             setSubmitting(false);
//         }
//         {
//             errorMessage && (
//                 <div className="bg-red-50 text-red-600 text-xs font-medium px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
//                     <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
//                     {errorMessage} {/* Displays: "Customer is already enrolled in this chit plan" */}
//                 </div>
//             )
//         }
//     };

//     // FIXED: Corrected conditional evaluation variable to reference 'loading'
//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-500 font-sans">
//                 <p className="animate-pulse">Compiling layout master fields, please wait...</p>
//             </div>
//         );
//     }


//     return (
//         <div className="min-h-screen bg-gray-50 font-sans p-6 flex items-center justify-center">
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-lg p-6 space-y-6">

//                 {/* Header */}
//                 <div>
//                     {/* Dynamic Navigation Home Button on Left Corner */}
//                     <button
//                         type="button"
//                         onClick={() => {
//                             if (window.location.pathname.includes("/admin")) {
//                                 navigate("/admin/dashboard");
//                             } else if (window.location.pathname.includes("/agent")) {
//                                 navigate("/agent/dashboard");
//                             } else {
//                                 navigate("/login");
//                             }
//                         }}
//                         className="mt-1 flex items-center justify-center p-2.5 border border-gray-200 bg-white hover:bg-gray-50 hover:text-indigo-600 text-gray-500 rounded-xl shadow-sm transition-colors"
//                         title="Go to Dashboard Home"
//                     >
//                         <span className="text-base leading-none">⬅️</span>
//                     </button>
//                 </div>

//                 <h2 className="text-xl font-bold text-gray-900">New Chit Enrollment</h2>
//                 <span>
//                     <p className="text-xs text-gray-400">
//                         Link an existing customer record to a designated operational chit subscription group.
//                     </p>
//                 </span>


//                 {errorMessage && (
//                     <div className="bg-red-50 text-red-600 text-xs font-medium px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
//                         <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
//                         {errorMessage}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-4">

//                     {/* Customer Selection Dropdown */}
//                     <div>
//                         <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
//                             Select Customer <span className="text-red-500">*</span>
//                         </label>
//                         <div>
//                             <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
//                                 Customer Phone Number
//                             </label>

//                             <div className="flex gap-2">
//                                 <input
//                                     type="text"
//                                     value={phone}
//                                     onChange={(e) => setPhone(e.target.value)}
//                                     placeholder="Enter mobile number"
//                                     className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
//                                 />

//                                 <button
//                                     type="button"
//                                     onClick={searchCustomerByPhone}
//                                     className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//                                 >
//                                     Search
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {selectedCustomer && (
//                         <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
//                             <p>
//                                 <strong>Name:</strong> {selectedCustomer.fullName}
//                             </p>

//                             <p>
//                                 <strong>Phone:</strong> {selectedCustomer.phone}
//                             </p>

//                             <p>
//                                 <strong>ID:</strong> {selectedCustomer.id}
//                             </p>
//                         </div>
//                     )}

//                     {/* Chit Plan Selection Dropdown */}
//                     <div>
//                         <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
//                             Assigned Chit Plan / Group <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             name="planId"
//                             value={formData.planId === "" || formData.planId === undefined ? "" : String(formData.planId)}
//                             onChange={handleChange}
//                             required
//                             className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
//                         >
//                             <option value="">-- Choose Scheme Value --</option>
//                             {plans.map((p, index) => {
//                                 if (typeof p !== "object" || p === null) {
//                                     return (
//                                         <option key={p || index} value={p ? String(p) : ""}>
//                                             Chit Scheme Plan #{p}
//                                         </option>
//                                     );
//                                 }

//                                 const planId = p.id !== undefined ? p.id : index;
//                                 const displayName = p.planName || p.groupName || p.name || `Plan Scheme #${planId}`;
//                                 const displayAmount = p.totalAmount || p.amount || p.chitValue || 0;

//                                 return (
//                                     <option key={planId} value={String(planId)}>
//                                         {displayName} — Max: ₹{displayAmount.toLocaleString("en-IN")}
//                                     </option>
//                                 );
//                             })}
//                         </select>
//                     </div>
//                     <div>
//                         <span className="text-gray-500">Monthly Installment:</span>
//                         <p className="font-medium">
//                             ₹{Number(
//                                 selectedPlan.monthlyAmount ||
//                                 selectedPlan.monthlyInstallment ||
//                                 0
//                             ).toLocaleString("en-IN")}
//                         </p>
//                     </div>

//                     <div>
//                         <span className="text-gray-500">Duration:</span>
//                         <p className="font-medium">
//                             {selectedPlan.durationMonths ||
//                                 selectedPlan.duration ||
//                                 0} Months
//                         </p>
//                     </div>

//                     <div>
//                         <span className="text-gray-500">Members:</span>
//                         <p className="font-medium">
//                             {selectedPlan.totalMembers ||
//                                 selectedPlan.maxMembers ||
//                                 "-"}
//                         </p>
//                     </div>
//                     {/* Date Input Entry Component */}
//                     <div>
//                         <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
//                             Enrollment Matrix Date <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="date"
//                             name="enrollmentDate"
//                             value={formData.enrollmentDate}
//                             onChange={handleChange}
//                             required
//                             className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
//                         />
//                     </div>

//                     {/* Action Panel Buttons Layout */}
//                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
//                         <button
//                             type="button"
//                             onClick={() => navigate(-1)}
//                             className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={submitting}
//                             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
//                         >
//                             {submitting ? "Processing Entry..." : "Submit Enrollment"}
//                         </button>
//                     </div>
//                     console.log("Selected Plan =", selectedPlan);
//                 </form>
//             </div>
//         </div >

//     );
// }