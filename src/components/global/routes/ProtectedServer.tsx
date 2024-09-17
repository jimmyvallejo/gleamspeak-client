import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedServerProps {
  isOwner: boolean | undefined;
  redirectPath: string;
}

const ProtectedServer: React.FC<ProtectedServerProps> = ({
  isOwner,
  redirectPath,
}) => {
  if (!isOwner) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedServer;
