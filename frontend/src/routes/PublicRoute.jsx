import { Navigate, Outlet } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import useAuth from "../hooks/useAuth";

export default function PublicRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingScreen label="Checking your session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
