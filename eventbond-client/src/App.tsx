import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import EventsListPage from './pages/EventsListPage';
import EventDetailPage from './pages/EventDetailPage';
import BookingsPage from './pages/BookingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEventsListPage from './pages/admin/AdminEventsListPage';
import AdminEventCreatePage from './pages/admin/AdminEventCreatePage';
import AdminEventEditPage from './pages/admin/AdminEditPage';
import AdminUsersListPage from './pages/admin/AdminUsersListPage';
import AdminBookingsListPage from './pages/admin/AdminBookingsListPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        <Route 
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="events" element={<AdminEventsListPage />} />
          <Route path="events/new" element={<AdminEventCreatePage />} />
          <Route path="events/edit/:id" element={<AdminEventEditPage />} />
          <Route path="users" element={<AdminUsersListPage />} />
          <Route path="bookings" element={<AdminBookingsListPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;