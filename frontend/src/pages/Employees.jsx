import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function Employees() {
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/users/employees");
        if (isMounted) setEmployees(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error(requestError);
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              (isPersian ? "دریافت فهرست کارمندان ناموفق بود." : "Failed to load employees."),
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadEmployees();
    return () => {
      isMounted = false;
    };
  }, [isPersian]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isPersian ? "کارمندان" : "Employees"}</h1>
          <p>{isPersian ? "فهرست حساب‌های کارمندی ثبت‌شده در سیستم" : "Employee accounts registered in the system"}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="badge badge-success">{employees.length} {isPersian ? "کارمند" : "employees"}</span>
          <Link className="btn btn-primary" to="/register">
            {isPersian ? "ثبت کارمند" : "Add employee"}
          </Link>
        </div>
      </div>

      {error && <div className="content-card" style={{ marginBottom: 20, padding: 15, color: "#c53030" }}>{error}</div>}

      <div className="content-card">
        <div className="content-card-header"><h3>{isPersian ? "همهٔ کارمندان" : "All Employees"}</h3></div>
        {loading ? (
          <div className="content-card-body">{isPersian ? "در حال بارگذاری..." : "Loading employees..."}</div>
        ) : employees.length === 0 ? (
          <div className="content-card-body">{isPersian ? "هنوز کارمندی ثبت نشده است." : "No employees registered yet."}</div>
        ) : (
          <div className="table-container" style={{ border: 0, borderRadius: 0 }}>
            <table>
              <thead><tr>
                <th>{isPersian ? "شناسه" : "ID"}</th>
                <th>{isPersian ? "نام" : "Name"}</th>
                <th>{isPersian ? "ایمیل" : "Email"}</th>
                <th>{isPersian ? "تاریخ ثبت‌نام" : "Registered"}</th>
              </tr></thead>
              <tbody>{employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.createdAt ? new Date(employee.createdAt).toLocaleDateString(isPersian ? "fa-AF" : undefined) : "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Employees;
