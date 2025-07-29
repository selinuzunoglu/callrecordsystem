import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string; // permission prop'u eklendi
}

const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  // Eğer permission parametresi varsa, permissions array'inde kontrol et
  if (permission) {
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
    if (!permissions.includes(permission)) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Eski userPermissions kontrolü (legacy)
  const currentUserId = Number(localStorage.getItem("user_id"));
  const userPermissions = JSON.parse(localStorage.getItem("user_permissions") || "[]");
  const canSeeUsers = userPermissions.some(
    (p: any) => Number(p.user_id) === currentUserId && p.permissionId === 1 && p.disabled === false
  );
  if (!canSeeUsers) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 