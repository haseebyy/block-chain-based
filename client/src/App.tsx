import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import DashboardHome from "./pages/DashboardHome";
import UserManagementPage from "./pages/UserManagementPage";
import VehicleRegistrationPage from "./pages/VehicleRegistrationPage";
import HashingPage from "./pages/HashingPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import ScannerPage from "./pages/ScannerPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="vehicles" element={<VehicleRegistrationPage />} />
        <Route path="hash" element={<HashingPage />} />
        <Route path="audit" element={<AuditTrailPage />} />
        <Route path="scanner" element={<ScannerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
