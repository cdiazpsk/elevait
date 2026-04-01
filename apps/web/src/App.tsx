import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import BuildingsListPage from "./pages/buildings/BuildingsListPage";
import BuildingDetailPage from "./pages/buildings/BuildingDetailPage";
import BuildingFormPage from "./pages/buildings/BuildingFormPage";
import ElevatorsListPage from "./pages/elevators/ElevatorsListPage";
import ElevatorDetailPage from "./pages/elevators/ElevatorDetailPage";
import ElevatorFormPage from "./pages/elevators/ElevatorFormPage";
import EventsListPage from "./pages/events/EventsListPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import EventFormPage from "./pages/events/EventFormPage";
import AlertsPage from "./pages/alerts/AlertsPage";
import ContractsPage from "./pages/contracts/ContractsPage";
import InvoicesListPage from "./pages/invoices/InvoicesListPage";
import InvoiceDetailPage from "./pages/invoices/InvoiceDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes (no sidebar) */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* App routes (with sidebar, requires auth) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/buildings" element={<BuildingsListPage />} />
            <Route path="/buildings/new" element={<BuildingFormPage />} />
            <Route path="/buildings/:id" element={<BuildingDetailPage />} />
            <Route path="/buildings/:id/edit" element={<BuildingFormPage />} />
            <Route path="/elevators" element={<ElevatorsListPage />} />
            <Route path="/elevators/new" element={<ElevatorFormPage />} />
            <Route path="/elevators/:id" element={<ElevatorDetailPage />} />
            <Route path="/elevators/:id/edit" element={<ElevatorFormPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/new" element={<EventFormPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/invoices" element={<InvoicesListPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
