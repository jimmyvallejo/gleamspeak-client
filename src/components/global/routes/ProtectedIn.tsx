import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedInProps {
  isAuthenticated: boolean | undefined;
  redirectPath: string;
}

const ProtectedIn: React.FC<ProtectedInProps> = ({
  isAuthenticated,
  redirectPath,
}) => {
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedIn;
