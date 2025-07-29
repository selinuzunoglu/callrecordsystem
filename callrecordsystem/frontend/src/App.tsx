import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import CallsPage from "./pages/CallsPage";
import Layout from "./pages/Layout";
import SantrallerPage from "./pages/SantrallerPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import UserPermissionsPage from "./pages/UserPermissionsPage";
// Diğer sayfalar...

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={
            <ProtectedRoute permission="user_manage">
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/users/:id/permissions" element={<UserPermissionsPage />} />
          <Route path="/calls" element={
            <ProtectedRoute permission="call_view">
              <CallsPage />
            </ProtectedRoute>
          } />
          <Route path="/santraller" element={<SantrallerPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Diğer layoutlu route'lar */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
