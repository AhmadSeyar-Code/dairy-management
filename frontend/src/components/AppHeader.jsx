import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Globe2, Milk, Search } from "lucide-react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function AppHeader() {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const isDari = language === "fa";
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const notificationsRef = useRef(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false);
      if (!notificationsRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setNotificationsOpen(false);
        setSearchOpen(true);
        searchRef.current?.querySelector("input")?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleShortcut);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const pages = useMemo(() => {
    const entries = [
      { to: "/dashboard", en: "Dashboard", fa: "داشبورد", roles: ["admin", "employee"] },
      { to: "/products", en: "Products", fa: "محصولات", roles: ["admin"] },
      { to: "/suppliers", en: "Suppliers", fa: "تأمین‌کنندگان", roles: ["admin"] },
      { to: "/customers", en: "Customers", fa: "مشتریان", roles: ["admin"] },
      { to: "/milk-purchases", en: "Milk purchases", fa: "خرید شیر", roles: ["admin"] },
      { to: "/sales", en: "Sales", fa: "فروش‌ها", roles: ["admin", "employee"] },
      { to: "/expenses", en: "Expenses", fa: "مصارف", roles: ["admin"] },
      { to: "/employees", en: "Employees", fa: "کارمندان", roles: ["admin"] },
      { to: "/admin/orders", en: "Orders", fa: "سفارش‌ها", roles: ["admin"] },
      { to: "/customer-dashboard", en: "My dashboard", fa: "داشبورد مشتری", roles: ["customer"] },
      { to: "/shop/products", en: "Shop products", fa: "محصولات فروشگاه", roles: ["customer"] },
      { to: "/cart", en: "Shopping cart", fa: "سبد خرید", roles: ["customer"] },
      { to: "/customer/orders", en: "My orders", fa: "سفارش‌های من", roles: ["customer"] },
    ];
    return entries.filter(({ roles }) => roles.includes(user?.role));
  }, [user]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];

    const matchingPages = pages
      .filter(({ en, fa }) => `${en} ${fa}`.toLocaleLowerCase().includes(normalizedQuery))
      .map((page) => ({
        ...page,
        label: isDari ? page.fa : page.en,
        detail: isDari ? "رفتن به بخش" : "Open section",
      }));

    const matchingProducts = (isAdmin || user?.role === "customer" ? products : [])
      .filter((product) => `${product.name || ""} ${product.category || ""}`.toLocaleLowerCase().includes(normalizedQuery))
      .slice(0, 5)
      .map((product) => ({
        to: user?.role === "customer" ? "/shop/products" : "/products",
        label: product.name,
        detail: product.category || (isDari ? "محصول" : "Product"),
      }));

    return [...matchingPages, ...matchingProducts].slice(0, 8);
  }, [isAdmin, isDari, normalizedQuery, pages, products, user?.role]);

  useEffect(() => {
    if (!searchOpen || !normalizedQuery || productsLoaded) return undefined;

    let isMounted = true;
    const timeout = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await api.get("/products");
        if (isMounted && Array.isArray(response.data)) {
          setProducts(response.data);
          setProductsLoaded(true);
          setSearchError("");
        }
      } catch (error) {
        console.error("Failed to search products:", error);
        if (isMounted) setSearchError(isDari ? "جستجوی محصولات ناموفق بود." : "Product search is unavailable.");
      } finally {
        if (isMounted) setSearchLoading(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
    };
  }, [isDari, normalizedQuery, productsLoaded, searchOpen]);

  useEffect(() => {
    if (!notificationsOpen || notificationsLoaded) return undefined;

    let isMounted = true;
    const loadNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");
      const requests = [api.get("/products")];
      if (isAdmin) requests.push(api.get("/orders"));
      const results = await Promise.allSettled(requests);

      if (!isMounted) return;

      const productResult = results[0];
      const orderResult = isAdmin ? results[1] : null;
      const nextNotifications = [];

      if (
        productResult.status === "fulfilled" &&
        Array.isArray(productResult.value.data) &&
        (isAdmin || user?.role === "customer")
      ) {
        productResult.value.data
          .filter((product) => Number(product.stock) <= 10)
          .forEach((product) => {
            nextNotifications.push({
              key: `stock-${product.id}`,
              to: isAdmin ? "/products" : "/shop/products",
              title: isDari ? `موجودی ${product.name} کم است` : `Low stock: ${product.name}`,
              detail: isDari
                ? `${Number(product.stock)} ${product.unit || ""} باقی مانده`
                : `${Number(product.stock)} ${product.unit || ""} remaining`,
            });
          });
      } else if (productResult.status === "rejected") {
        console.error("Failed to load low-stock notifications:", productResult.reason);
      }

      if (orderResult?.status === "fulfilled" && Array.isArray(orderResult.value.data)) {
        orderResult.value.data
          .filter((order) => order.status === "pending")
          .forEach((order) => {
            nextNotifications.push({
              key: `order-${order.id}`,
              to: "/admin/orders",
              title: isDari ? `سفارش جدید #${order.id}` : `New order #${order.id}`,
              detail: order.customer?.name || (isDari ? "در انتظار بررسی" : "Awaiting review"),
            });
          });
      } else if (orderResult?.status === "rejected") {
        console.error("Failed to load pending-order notifications:", orderResult.reason);
      }

      const hasFailedRequest = results.some((result) => result.status === "rejected");
      setNotifications(nextNotifications);
      setNotificationsError(
        hasFailedRequest && nextNotifications.length === 0
          ? (isDari ? "دریافت اعلان‌ها ناموفق بود." : "Could not load notifications.")
          : "",
      );
      setNotificationsLoaded(true);
      setNotificationsLoading(false);
    };

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [isAdmin, isDari, notificationsLoaded, notificationsOpen, user?.role]);

  const openResult = (result) => {
    navigate(result.to);
    setQuery("");
    setSearchOpen(false);
    setActiveResult(0);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      setQuery("");
      return;
    }

    if (event.key === "ArrowDown" && searchResults.length) {
      event.preventDefault();
      setActiveResult((index) => (index + 1) % searchResults.length);
      return;
    }

    if (event.key === "ArrowUp" && searchResults.length) {
      event.preventDefault();
      setActiveResult((index) => (index - 1 + searchResults.length) % searchResults.length);
      return;
    }

    if (event.key === "Enter" && searchResults[activeResult]) {
      event.preventDefault();
      openResult(searchResults[activeResult]);
    }
  };

  return (
    <header className="dashboard-topbar app-topbar" dir={isDari ? "rtl" : "ltr"}>
      <div className="app-search-wrap" ref={searchRef}>
        <label className="dashboard-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder={isDari ? "جستجو در سیستم..." : "Search the system..."}
            aria-label={isDari ? "جستجو در سیستم" : "Search the system"}
            aria-expanded={searchOpen && Boolean(normalizedQuery)}
            aria-controls="app-search-results"
            onFocus={() => {
              setSearchOpen(true);
              setNotificationsOpen(false);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchError("");
              setSearchOpen(true);
              setActiveResult(0);
            }}
            onKeyDown={handleSearchKeyDown}
          />
          {query && (
            <button type="button" className="search-clear" onClick={() => { setQuery(""); setActiveResult(0); searchRef.current?.querySelector("input")?.focus(); }} aria-label={isDari ? "پاک‌کردن جستجو" : "Clear search"}>
              ×
            </button>
          )}
        </label>
        {searchOpen && normalizedQuery && (
          <div className="app-search-results" id="app-search-results" role="listbox">
            {searchResults.map((result, index) => (
              <button
                type="button"
                className={`app-search-result ${index === activeResult ? "active" : ""}`}
                key={`${result.to}-${result.label}`}
                role="option"
                aria-selected={index === activeResult}
                onMouseEnter={() => setActiveResult(index)}
                onClick={() => openResult(result)}
              >
                <span className="app-search-result-icon"><Search size={14} aria-hidden="true" /></span>
                <span className="app-search-result-copy"><strong>{result.label}</strong><small>{result.detail}</small></span>
              </button>
            ))}
            {searchResults.length === 0 && (
              <div className="app-search-empty">
                {searchLoading
                  ? (isDari ? "در حال جستجو..." : "Searching...")
                  : searchError || (isDari ? "نتیجه‌ای پیدا نشد." : "No matching pages or products.")}
              </div>
            )}
            <div className="app-search-hint">{isDari ? "برای انتخاب از کلیدهای ↑ ↓ و Enter استفاده کنید" : "Use ↑ ↓ and Enter to select"}</div>
          </div>
        )}
      </div>
      <div className="topbar-actions">
        <button
          type="button"
          className="language-switch"
          onClick={toggleLanguage}
          aria-label={isDari ? "Switch to English" : "تغییر زبان به دری"}
        >
          <span className={isDari ? "selected" : ""}>دری</span>
          <Globe2 size={15} aria-hidden="true" />
          <span className={!isDari ? "selected" : ""}>EN</span>
        </button>
        <div className="app-notification-wrap" ref={notificationsRef}>
          <button
            type="button"
            className="notification-button app-notification"
            aria-label={isDari ? "اعلان‌ها" : "Notifications"}
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            <Bell size={18} aria-hidden="true" />
            {notifications.length > 0 && <span className="notification-count">{notifications.length > 9 ? "9+" : notifications.length}</span>}
          </button>
          {notificationsOpen && (
            <section className="app-notifications" aria-label={isDari ? "اعلان‌ها" : "Notifications"}>
              <div className="app-notifications-heading">
                <strong>{isDari ? "اعلان‌ها" : "Notifications"}</strong>
                {notifications.length > 0 && <span>{notifications.length}</span>}
              </div>
              {notificationsLoading ? (
                <div className="app-notifications-empty">{isDari ? "در حال دریافت اعلان‌ها..." : "Loading notifications..."}</div>
              ) : notifications.length ? (
                <div className="app-notifications-list">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      className="app-notification-item"
                      key={notification.key}
                      onClick={() => {
                        navigate(notification.to);
                        setNotificationsOpen(false);
                      }}
                    >
                      <span className="app-notification-dot" />
                      <span><strong>{notification.title}</strong><small>{notification.detail}</small></span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="app-notifications-empty">{notificationsError || (isDari ? "اعلان تازه‌ای ندارید." : "You’re all caught up.")}</div>
              )}
            </section>
          )}
        </div>
        <div className="topbar-brand">
          <span className="topbar-brand-icon"><Milk size={23} aria-hidden="true" /></span>
          <span>
            <strong>Dairy Management</strong>
            <small>{isDari ? "مدیریت لبنیات" : "Dairy operations"}</small>
          </span>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
