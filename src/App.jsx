import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./roots/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import { AuthProvider } from "./components/AuthContext";

import ChitFundDashboard from "./pages/ChitFundDashboard";

import LoginPage from "./pages/LoginPage";
import CreateChitPlan from "./pages/chitPlans/CreateChitPlan";
import ChitPlanManagement from "./pages/ChitPlanManagement";
import ChitEnrollment from "./pages/ChitEnrollment";
import CollectPayment from "./pages/CollectPayment";
import CollectionTracker from "./pages/CollectionTracker";
import CustomerManagementTable from "./pages/CustomerManagementTable";
import CollectionEntry from "./payment/Payment";
import ChitPlanList from "./pages/chitPlans/ChitPlanList";
import DashboardPage from "./pages/Dashboard";
import CustomerManageByInduvidual from "./pages/CustomerManageByInduvidual";
import EnrollmentTracker from "./pages/EnrollementTracker";

import CustomerDashboard from "./pages/CustomerDashboard";
import Payment from "./payment/Payment";
import ChitEnrollCustomer from "./pages/ChitEnrollment";
import JoinNewChit from "./pages/Joinnewchit";
import CustomerPortal from "./pages/Dashboard";



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* ADMIN */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ChitFundDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/customers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CustomerManagementTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/chits"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ChitPlanManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/chits/create"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CreateChitPlan />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/payment"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
                <CreateChitPlan />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/payment"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
                <ChitFundDashboard />
              </ProtectedRoute>
            }
          />


          <Route
            path="/admin/dashboard/chits/view"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ChitPlanList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/payment"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER", "CUSTOMER"]}>
                <CollectPayment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/dashboard/payment"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER", "CUSTOMER"]}>
                <CollectPayment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/dashboard/enrollment"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "USER"]}>
                <ChitEnrollment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/CollectionTracker"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CollectionTracker />
              </ProtectedRoute>
            }
          />


          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/dashboard/profile"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerManageByInduvidual />
              </ProtectedRoute>
            }
          />



          {/* CUSTOMER */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/dashboard/profile"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerManageByInduvidual />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/dashboard/enrollments"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <EnrollmentTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/phone/:phone"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerManageByInduvidual />
              </ProtectedRoute>
            }
          />

          {/* Customer Portal */}
          <Route
            path="/my-chits"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerManageByInduvidual />
              </ProtectedRoute>
            }
          />


          {/* Enrollment */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <CustomerPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "USER"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/customer/enrollChits"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "USER"]}>
                <JoinNewChit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/dashboard/enroll-trac"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <EnrollmentTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/dashboard/collections/payment/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
                <Payment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/dashbaord"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />


          {/* Unauthorized */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;