import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { HomePage } from '@/pages/HomePage';
import { AuthenticationPage } from '@/pages/AuthenticationPage';
import { UserDashboardPage } from '@/pages/UserDashboardPage';
import { PricingPage } from '@/pages/PricingPage';
import { Toaster } from '@/components/ui/sonner';
import { AuthRedirect, ProtectedRoute } from './components/auth/AuthLayout';
const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthRedirect />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/auth",
    element: <AuthenticationPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <UserDashboardPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/project/:projectId",
        element: <HomePage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ErrorBoundary>
  </StrictMode>,
)