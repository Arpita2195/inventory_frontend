import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import InventoryPage from "./pages/InventoryPage";
import SuppliersPage from "./pages/SuppliersPage";
import OffersPage from "./pages/OffersPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import BillingPage from "./pages/BillingPage";
import KhataPage from "./pages/KhataPage";
import KhataDetailPage from "./pages/KhataDetailPage";
import TrustPage from "./pages/TrustPage";
import Layout from "./components/Layout";

const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <Protected>
                <InventoryProvider>
                  <Layout />
                </InventoryProvider>
              </Protected>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="khata" element={<KhataPage />} />
            <Route path="khata/:id" element={<KhataDetailPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="trust" element={<TrustPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
