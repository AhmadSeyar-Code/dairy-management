import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function CustomerRegister() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const isPersian = language === "fa";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/customer-register", form);
      navigate("/login", { state: { customerRegistered: true } });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (isPersian ? "ساخت حساب مشتری ناموفق بود." : "Customer registration failed."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button type="button" onClick={toggleLanguage} className="auth-language-button">
        {isPersian ? "English" : "دری"}
      </button>
      <div className="auth-form-container" style={{ width: "100%" }}>
        <div className="auth-card">
          <div className="auth-header">
            <h2>{isPersian ? "ایجاد حساب مشتری" : "Create Customer Account"}</h2>
            <p>{isPersian ? "برای سفارش محصولات لبنی ثبت‌نام کنید" : "Register to order dairy products"}</p>
          </div>
          {error && <div className="auth-alert error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group">
                <label>{isPersian ? "نام" : "Name"}</label>
                <input name="name" value={form.name} onChange={update} maxLength={100} required />
              </div>
              <div className="form-group">
                <label>{isPersian ? "ایمیل" : "Email"}</label>
                <input type="email" name="email" value={form.email} onChange={update} maxLength={191} required />
              </div>
              <div className="form-group">
                <label>{isPersian ? "رمز عبور" : "Password"}</label>
                <input type="password" name="password" value={form.password} onChange={update} minLength={8} maxLength={72} required />
              </div>
              <div className="form-group">
                <label>{isPersian ? "شماره تماس" : "Phone"}</label>
                <input type="tel" name="phone" value={form.phone} onChange={update} maxLength={40} required />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>{isPersian ? "آدرس" : "Address"}</label>
                <textarea name="address" value={form.address} onChange={update} maxLength={2000} rows={3} required />
              </div>
            </div>
            <button className="auth-submit" disabled={loading}>
              {loading ? (isPersian ? "در حال ثبت‌نام..." : "Registering...") : (isPersian ? "ثبت‌نام" : "Register")}
            </button>
          </form>
          <div className="auth-footer">
            <span>{isPersian ? "حساب دارید؟" : "Already have an account?"}</span>
            <Link to="/login">{isPersian ? "ورود" : "Sign in"}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerRegister;
