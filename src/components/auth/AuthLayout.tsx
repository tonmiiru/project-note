import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from '@/stores/useAuthStore';
import { LandingPage } from '@/pages/LandingPage';
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}
export function AuthRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}