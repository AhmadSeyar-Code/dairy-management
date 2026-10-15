import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CircleGauge,
  Languages,
  LogOut,
  Milk,
  Package,
  Receipt,
  ShoppingCart,
  Store,
  Truck,
  UsersRound,
  Wallet,
} from "lucide-react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const isPersian = language === "fa";

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let isMounted = true;

    api.get("/auth/me")
      .then(({ data }) => {
        if (!isMounted) return;
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch((error) => console.error("Failed to load current user:", error));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menu = [
    {
      path: user?.role === "customer" ? "/customer-dashboard" : "/dashboard",
      icon: CircleGauge,
      en: "Dashboard",
      fa: user?.role === "customer" ? "داشبورد مشتری" : "داشبورد",
      access: "all",
    },
    { path: "/products", icon: Package, en: "Products", fa: "محصولات", access: "admin" },
    { path: "/suppliers", icon: Truck, en: "Suppliers", fa: "تأمین‌کنندگان", access: "admin" },
    { path: "/customers", icon: UsersRound, en: "Customers", fa: "مشتریان", access: "admin" },
    { path: "/milk-purchases", icon: Milk, en: "Milk Purchases", fa: "خرید شیر", access: "admin" },
    { path: "/sales", icon: Receipt, en: "Sales", fa: "فروش‌ها", access: "staff" },
    { path: "/expenses", icon: Wallet, en: "Expenses", fa: "مصارف", access: "admin" },
    { path: "/employees", icon: UsersRound, en: "Employees", fa: "کارمندان", access: "admin" },
    { path: "/admin/orders", icon: ClipboardList, en: "Orders", fa: "سفارش‌ها", access: "admin" },
    { path: "/shop/products", icon: Store, en: "Shop Products", fa: "محصولات فروشگاه", access: "customer" },
    { path: "/cart", icon: ShoppingCart, en: "Cart", fa: "سبد خرید", access: "customer" },
    { path: "/customer/orders", icon: ClipboardList, en: "My Orders", fa: "سفارش‌های من", access: "customer" },
  ];

  const visibleMenu = menu.filter(
    (item) => item.access === "all" ||
      (item.access === "admin" && user?.role === "admin") ||
      (item.access === "staff" && ["admin", "employee"].includes(user?.role)) ||
      (item.access === "customer" && user?.role === "customer"),
  );

  return (
    <aside className={`professional-sidebar ${isPersian ? "sidebar-rtl" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-symbol"><Milk size={23} aria-hidden="true" /></div>
        <div>
          <h2>Dairy</h2>
          <span>Management</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || "U"}</div>
        <div className="user-info">
          <strong>{user?.name || "User"}</strong>
          <span>
            {user?.role === "admin"
              ? (isPersian ? "مدیر سیستم" : "Administrator")
              : user?.role === "customer"
                ? (isPersian ? "مشتری" : "Customer")
                : (isPersian ? "کارمند" : "Employee")}
          </span>
        </div>
      </div>

      <div className="sidebar-section-title">{isPersian ? "منوی اصلی" : "MAIN MENU"}</div>

      <nav className="professional-menu">
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `professional-link ${isActive ? "active" : ""}`}
            >
              <span className="menu-icon"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
              <span>{isPersian ? item.fa : item.en}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-action" onClick={toggleLanguage}>
          <Languages size={18} aria-hidden="true" />
          {isPersian ? "English" : "دری"}
        </button>
        <button type="button" className="sidebar-action logout" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" />
          {isPersian ? "خروج" : "Logout"}
        </button>
      </div>
    </aside>
  );
}

export default Navbar;
