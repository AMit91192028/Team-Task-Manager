import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <LoadingScreen label="Preparing your workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
