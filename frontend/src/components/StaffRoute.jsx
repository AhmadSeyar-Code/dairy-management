import { Navigate } from "react-router-dom";

function StaffRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "employee") {
    return <Navigate to={user?.role === "customer" ? "/customer-dashboard" : "/login"} replace />;
  }
  return children;
}

export default StaffRoute;
