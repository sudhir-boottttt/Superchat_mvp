import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CreatorRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== "creator") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default CreatorRoute;
