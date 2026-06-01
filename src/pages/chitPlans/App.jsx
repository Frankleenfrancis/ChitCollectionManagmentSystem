// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./components/AuthContext";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import Unauthorized from "./pages/Unauthorized";

// import AgentDashboard from "./pages/AgentDashboard";
// import ChitFundDashboard from "./pages/ChitFundDashboard";
// import CustomerManagement from "./pages/AgentDashboard";
// import CreateAgent from "./pages/CreateAgent";
// import CreateCustomer from "./pages/CreateCustomer";
// import Dashboard from "./pages/Dashboard";
// import LoginPage from "./pages/LoginPage";

// import EditCustomer from "./components/EditCustomer";
// import ChitPlanList from "./pages/chitPlans/ChitPlanList";
// import CreateChitPlan from "./pages/chitPlans/CreateChitPlan";

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           {/* Default Root Redirect - Send users straight to login if they type just the domain */}
//           <Route path="/" element={<Navigate to="/login" replace />} />

//           {/* Public Login Route */}
//           <Route path="/login" element={<LoginPage />} />

//           {/* Admin Main Dashboard Workspace */}
//           <Route
//             path="/admin/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["ADMIN"]}>
//                 <ChitFundDashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* Agent Main Dashboard Workspace (Reusing your same core layout component) */}
//           <Route
//             path="/agent/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["AGENT"]}>
//                 <ChitFundDashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* Admin agent-create Profile Setup */}
//           <Route
//             path="/admin/dashboard/agent"
//             element={
//               <ProtectedRoute allowedRoles={["ADMIN"]}>
//                 <CreateAgent />
//               </ProtectedRoute>
//             }
//           />

//           {/* Shared View: Both Admin and Agents can see the customer data ledger table */}
//           <Route
//             path="/admin/dashboard/customers"
//             element={
//               <ProtectedRoute allowedRoles={["ADMIN", "AGENT"]}>
//                 <AgentDashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* Strict Actions: Restrict customer creation tool to ADMIN only */}
//           <Route
//             path="/admin/dashboard/customers/create-customer"
//             element={
//               <ProtectedRoute allowedRoles={["ADMIN"]}>
//                 <CreateCustomer />
//               </ProtectedRoute>
//             }
//           />

//           {/* Strict Actions: Restrict profile editor tool to ADMIN only */}
//           <Route
//             path="/admin/dashboard/edit-customer/:id"
//             element={
//               <ProtectedRoute allowedRoles={["ADMIN"]}>
//                 <CreateCustomer />
//               </ProtectedRoute>
//             }
//           />


//           <Route
//             path="/agent/dashboard/chits"
//             element={
//               <ProtectedRoute allowedRoles={["AGENT"]}>
//                 <ChitPlanList />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin/dashboard/chits"
//             element={
//               <ProtectedRoute allowedRoles={["ADMIN"]}>
//                 <ChitPlanList />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/agent/dashboard/chits/Create"
//             element={
//               <ProtectedRoute allowedRoles={["ADMIN", "AGENT"]}>
//                 <CreateChitPlan />
//               </ProtectedRoute>
//             }
//           />



//           <Route path="/edit-customer/:id" element={<EditCustomer />} />

//           <Route path="/chits" element={<new />} />

//           {/* Denied Access Fallback Component UI */}
//           <Route path="/unauthorized" element={<Unauthorized />} />

//           {/* Catch-all Fallback (Optional): Redirect unknown pages back to login */}
//           <Route path="*" element={<Navigate to="/login" replace />} />



//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;