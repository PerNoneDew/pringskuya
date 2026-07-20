import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider, useBooking } from './lib/context';
import { Toaster } from './components/ui/toaster';
import { TransitionProvider } from './providers/transition-provider';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import AdminPage from './pages/admin';
import AdminGuestsPage from './pages/admin/guests';
import AdminRoomsPage from './pages/admin/rooms';
import AdminReservationsPage from './pages/admin/reservations';
import AdminEventsPage from './pages/admin/events';
import AdminServicesPage from './pages/admin/services';
import AdminStaffPage from './pages/admin/staff';
import AdminPaymentsPage from './pages/admin/payments';
import AdminReportsPage from './pages/admin/reports';
import AdminSettingsPage from './pages/admin/settings';
import CustomerPage from './pages/customer/index';
import CustomerMyBookingsPage from './pages/customer/my-bookings';
import CustomerEventsPage from './pages/customer/events';
import StaffPage from './pages/staff';
import StaffCheckInPage from './pages/staff/check-in';
import StaffCheckOutPage from './pages/staff/check-out';
import StaffEventsPage from './pages/staff/events';
import StaffReservationsPage from './pages/staff/reservations';
import StaffReportsPage from './pages/staff/reports';
import StaffSettingsPage from './pages/staff/settings';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-800 to-amber-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mb-4"></div>
        <p className="text-amber-100 text-lg font-medium">Loading data...</p>
        <p className="text-amber-200/60 text-sm mt-2">Connecting to database</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { isLoading } = useBooking();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/guests" element={<AdminGuestsPage />} />
      <Route path="/admin/rooms" element={<AdminRoomsPage />} />
      <Route path="/admin/reservations" element={<AdminReservationsPage />} />
      <Route path="/admin/events" element={<AdminEventsPage />} />
      <Route path="/admin/services" element={<AdminServicesPage />} />
      <Route path="/admin/staff" element={<AdminStaffPage />} />
      <Route path="/admin/payments" element={<AdminPaymentsPage />} />
      <Route path="/admin/reports" element={<AdminReportsPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />

      {/* Customer Routes */}
      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/customer/my-bookings" element={<CustomerMyBookingsPage />} />
      <Route path="/customer/events" element={<CustomerEventsPage />} />

      {/* Staff Routes */}
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/staff/check-in" element={<StaffCheckInPage />} />
      <Route path="/staff/check-out" element={<StaffCheckOutPage />} />
      <Route path="/staff/reservations" element={<StaffReservationsPage />} />
      <Route path="/staff/events" element={<StaffEventsPage />} />
      <Route path="/staff/reports" element={<StaffReportsPage />} />
      <Route path="/staff/settings" element={<StaffSettingsPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <TransitionProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
        <Toaster />
      </TransitionProvider>
    </Router>
  );
}

export default App;
