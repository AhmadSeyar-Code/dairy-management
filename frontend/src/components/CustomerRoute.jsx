import { Navigate } from "react-router-dom";

function CustomerRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "customer") return <Navigate to="/dashboard" replace />;
  return children;
}

export default CustomerRoute;
