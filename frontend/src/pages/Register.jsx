import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdUser, setCreatedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setCreatedUser(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      setCreatedUser(response.data.user);
      setSuccess(response.data.message || "حساب کاربری با موفقیت ساخته شد.");
    } catch (error) {
      setError(error.response?.data?.message || "ثبت نام انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE */}
      <div className="auth-brand">
        <div className="brand-content">
          <div className="brand-logo">🥛</div>

          <h1>Dairy Management</h1>

          <p>سیستم مدیریت حرفه‌ای لبنیات</p>

          <div className="brand-features">
            <div>✓ مدیریت محصولات</div>
            <div>✓ مدیریت فروش و خرید</div>
            <div>✓ مدیریت مشتریان و تأمین‌کنندگان</div>
            <div>✓ گزارش‌گیری مالی</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="mobile-logo">🥛</div>

            <h2>ایجاد حساب</h2>

            <p>حساب جدید خود را ایجاد کنید</p>
          </div>

          {error && <div className="auth-alert error">{error}</div>}

          {success && (
            <div className="auth-alert success">
              <p>{success}</p>
              {createdUser && (
                <div>
                  <div>نام: {createdUser.name}</div>
                  <div>ایمیل: {createdUser.email}</div>
                </div>
              )}
              <p>برای ادامه وارد حساب خود شوید.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <div className="form-group">
              <label>نام</label>

              <input
                type="text"
                name="name"
                placeholder="نام خود را وارد کنید"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>ایمیل</label>

              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label>رمز عبور</label>

              <input
                type="password"
                name="password"
                placeholder="رمز عبور را وارد کنید"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "در حال ثبت نام..." : "ایجاد حساب"}
            </button>
          </form>

          <div className="auth-footer">
            <span>حساب دارید؟</span>

            <Link to="/login">ورود به حساب</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
