import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Globe2, LockKeyhole, Milk, UserRound } from "lucide-react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  const isPersian = language === "fa";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate(user.role === "customer" ? "/customer-dashboard" : "/dashboard");
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian
            ? "ایمیل یا رمز عبور نادرست است."
            : "Invalid email or password."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page" dir="ltr">
      <section className="auth-brand login-brand">
        <div className="login-landscape" aria-hidden="true">
          <span className="landscape-sun" />
          <span className="landscape-cloud cloud-one" />
          <span className="landscape-cloud cloud-two" />
          <span className="landscape-mountain mountain-one" />
          <span className="landscape-mountain mountain-two" />
          <span className="landscape-hill hill-back" />
          <span className="landscape-hill hill-front" />
          <span className="landscape-grass grass-one" />
          <span className="landscape-grass grass-two" />
        </div>

        <div className="login-brand-content" dir={isPersian ? "rtl" : "ltr"}>
          <div className="login-brand-mark"><Milk size={30} strokeWidth={1.7} /></div>
          <h1>Dairy Management</h1>
          <span className="login-brand-title-fa">مدیریت لبنیات</span>
          <div className="login-brand-divider"><span /></div>
          <p>{isPersian ? "سالم، تازه، با کیفیت" : "Fresh dairy. Better life."}</p>
          <div className="login-brand-tagline">
            <span>Fresh Milk</span><i /> <span>{isPersian ? "زندگی بهتر" : "Better Life"}</span>
          </div>
          <div className="login-dairy-display" aria-hidden="true">
            <span className="dairy-display-cow">🐄</span>
            <span className="dairy-display-milk">🥛</span>
            <span className="dairy-display-cheese">🧀</span>
            <span className="dairy-display-yogurt">🥣</span>
          </div>
          <div className="login-brand-caption">
            {isPersian ? "از مزرعه تا سفره، با اطمینان" : "From our farm to your table"}
          </div>
        </div>
      </section>

      <section className="auth-form-container login-form-side" dir={isPersian ? "rtl" : "ltr"}>
        <button
          type="button"
          onClick={toggleLanguage}
          className="auth-language-button login-language-button"
        >
          <Globe2 size={16} aria-hidden="true" />
          {isPersian ? "English" : "دری"}
        </button>

        <div className="auth-card login-card">
          <div className="auth-header login-header">
            <div className="mobile-logo login-mobile-logo"><Milk size={25} /></div>
            <span className="login-kicker">{isPersian ? "به سیستم لبنیات" : "DAIRY MANAGEMENT SYSTEM"}</span>
            <h2>{isPersian ? "ورود به حساب کاربری" : "Welcome back"}</h2>
            <p>{isPersian ? "برای ادامه وارد حساب خود شوید" : "Sign in to continue to your account"}</p>
          </div>

          {error && <div className="auth-alert error">{error}</div>}
          {location.state?.customerRegistered && (
            <div className="auth-alert success" role="status">
              {isPersian ? "حساب مشتری ساخته شد. اکنون وارد شوید." : "Customer account created. You can now sign in."}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group login-field">
              <label htmlFor="login-email">{isPersian ? "ایمیل یا نام کاربری" : "Email or username"}</label>
              <div className="login-input-wrap">
                <UserRound size={17} aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder={isPersian ? "ایمیل خود را وارد کنید" : "Enter your email address"}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group login-field">
              <label htmlFor="login-password">{isPersian ? "رمز عبور" : "Password"}</label>
              <div className="login-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder={isPersian ? "رمز عبور خود را وارد کنید" : "Enter your password"}
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? (isPersian ? "پنهان کردن رمز عبور" : "Hide password") : (isPersian ? "نمایش رمز عبور" : "Show password")}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit login-submit" disabled={loading}>
              {loading
                ? isPersian
                  ? "در حال ورود..."
                  : "Signing in..."
                : isPersian
                  ? "ورود به حساب"
                  : "Sign In"}
            </button>
          </form>

          <div className="auth-footer login-footer">
            <span>{isPersian ? "حساب مشتری ندارید؟" : "New customer?"}</span>
            <Link to="/customer-register">{isPersian ? "ایجاد حساب" : "Create an account"}</Link>
          </div>

          <div className="login-secure-note">
            <LockKeyhole size={13} aria-hidden="true" />
            <span>{isPersian ? "ورود امن به حساب لبنیات شما" : "Your account is protected with secure sign-in"}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
