import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type EmployeeRole } from "./AuthContext";

export const RoleGuard = ({
  allowedRoles,
}: {
  allowedRoles: EmployeeRole[];
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6 text-sm text-[#89847b]" role="status">
        Уншиж байна...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
