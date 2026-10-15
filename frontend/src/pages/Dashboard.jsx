import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  ChartNoAxesCombined,
  CircleCheck,
  Clock3,
  Milk,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  Truck,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import "./Dashboard.css";

const initialData = {
  totalProducts: 0,
  totalCustomers: 0,
  totalSales: 0,
  totalExpenses: 0,
  totalPurchases: 0,
  profit: 0,
};

const chartColors = ["#347ff0", "#22b77d", "#f3ae3d", "#9860ef", "#ed6682", "#40b6cc"];

function Dashboard() {
  const { language } = useLanguage();
  const isDari = language === "fa";
  const [data, setData] = useState(initialData);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salesUnavailable, setSalesUnavailable] = useState(false);
  const [productsUnavailable, setProductsUnavailable] = useState(false);
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const [dashboardResult, salesResult, productsResult] = await Promise.allSettled([
        api.get("/reports/dashboard"),
        api.get("/sales"),
        api.get("/products"),
      ]);

      if (!isMounted) return;

      if (dashboardResult.status === "rejected") {
        console.error("Failed to load dashboard:", dashboardResult.reason);
        setError(isDari ? "دریافت اطلاعات داشبورد ناموفق بود." : "Failed to load dashboard data.");
        setLoading(false);
        return;
      }

      const summary = dashboardResult.value.data;
      setData({
        totalProducts: Number(summary.totalProducts) || 0,
        totalCustomers: Number(summary.totalCustomers) || 0,
        totalSales: Number(summary.totalSales) || 0,
        totalExpenses: Number(summary.totalExpenses) || 0,
        totalPurchases: Number(summary.totalPurchases) || 0,
        profit: Number(summary.profit) || 0,
      });

      if (salesResult.status === "fulfilled" && Array.isArray(salesResult.value.data)) {
        setSales(salesResult.value.data);
        setSalesUnavailable(false);
      } else {
        if (salesResult.status === "rejected") {
          console.error("Failed to load dashboard sales:", salesResult.reason);
        }
        setSalesUnavailable(true);
      }

      if (productsResult.status === "fulfilled" && Array.isArray(productsResult.value.data)) {
        setProducts(productsResult.value.data);
        setProductsUnavailable(false);
      } else {
        if (productsResult.status === "rejected") {
          console.error("Failed to load dashboard products:", productsResult.reason);
        }
        setProductsUnavailable(true);
      }

      setLoading(false);
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [isDari]);

  const formatNumber = (value, maximumFractionDigits = 0) =>
    Number(value || 0).toLocaleString(isDari ? "fa-AF" : "en-US", {
      maximumFractionDigits,
    });
  const formatMoney = (value) => `${formatNumber(value, 2)} AFN`;

  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const amount = sales.reduce((sum, sale) => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= date && saleDate < nextDate
          ? sum + Number(sale.totalAmount || 0)
          : sum;
      }, 0);

      days.push({
        date,
        amount,
        label: date.toLocaleDateString(isDari ? "fa-AF" : "en-US", {
          day: "numeric",
          month: "short",
        }),
      });
    }

    return days;
  }, [sales, isDari]);

  const maxDailySales = Math.max(...weekDays.map(({ amount }) => amount), 1);
  const categoryData = useMemo(() => {
    const categories = new Map();
    products.forEach((product) => {
      const category = product.category || (isDari ? "بدون دسته‌بندی" : "Uncategorised");
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return [...categories.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6);
  }, [products, isDari]);

  const categoryTotal = categoryData.reduce((sum, category) => sum + category.count, 0);
  const pieSegments = categoryData.map((category, index) => {
    const start = categoryData.slice(0, index).reduce(
      (sum, previous) => sum + (categoryTotal ? (previous.count / categoryTotal) * 100 : 0),
      0,
    );
    const percentage = categoryTotal ? (category.count / categoryTotal) * 100 : 0;
    return `${chartColors[index]} ${start}% ${start + percentage}%`;
  });

  const latestSales = sales.slice(0, 5);
  const lowestStockProducts = [...products]
    .sort((left, right) => Number(left.stock || 0) - Number(right.stock || 0))
    .slice(0, 4);
  const isAdmin = user?.role === "admin";
  const quickLinks = [
    ...(isAdmin ? [{ to: "/milk-purchases", label: isDari ? "ثبت خرید شیر" : "Record milk purchase", Icon: Truck, color: "blue" }] : []),
    { to: "/sales", label: isDari ? "ثبت فروش" : "Record a sale", Icon: ShoppingCart, color: "green" },
    ...(isAdmin ? [{ to: "/products", label: isDari ? "افزودن محصول" : "Add a product", Icon: Package, color: "purple" }] : []),
    ...(isAdmin ? [{ to: "/expenses", label: isDari ? "ثبت مصرف" : "Record an expense", Icon: WalletCards, color: "rose" }] : []),
  ];

  if (loading) {
    return (
      <div className="dairy-dashboard" dir={isDari ? "rtl" : "ltr"}>
        <div className="dashboard-loading">
          <span className="loading-spinner" />
          <span>{isDari ? "داشبورد در حال بارگذاری است..." : "Loading your dashboard..."}</span>
        </div>
      </div>
    );
  }

  const stats = [
    { title: isDari ? "محصولات در انبار" : "Products in inventory", value: formatNumber(data.totalProducts), unit: isDari ? "محصول" : "items", Icon: Package, tone: "orange" },
    { title: isDari ? "فروش مجموعی" : "Total sales", value: formatMoney(data.totalSales), unit: isDari ? "مجموع" : "overall", Icon: ShoppingCart, tone: "green" },
    { title: isDari ? "مشتریان" : "Customers", value: formatNumber(data.totalCustomers), unit: isDari ? "مشتری ثبت‌شده" : "registered", Icon: UsersRound, tone: "blue" },
    { title: isDari ? "مصارف مجموعی" : "Total expenses", value: formatMoney(data.totalExpenses), unit: isDari ? "مجموع" : "overall", Icon: WalletCards, tone: "purple" },
  ];

  return (
    <div className="dairy-dashboard" dir={isDari ? "rtl" : "ltr"}>
      <div className="dashboard-columns">
        <main className="dashboard-main">
          <section className="dashboard-hero">
            <div className="hero-copy">
              <span className="hero-eyebrow">{isDari ? "داشبورد مدیریتی" : "MANAGEMENT OVERVIEW"}</span>
              <h1>{isDari ? "به سیستم مدیریت لبنیات خوش آمدید" : "Welcome to Dairy Management"}</h1>
              <p>{isDari ? "با ما کسب‌وکار لبنیات خود را بهتر مدیریت کنید" : "Everything you need to keep your dairy business running smoothly."}</p>
              <span className="hero-date"><Clock3 size={14} aria-hidden="true" />{new Date().toLocaleDateString(isDari ? "fa-AF" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="hero-art" aria-hidden="true">
              <span className="hero-orbit orbit-one" />
              <span className="hero-orbit orbit-two" />
              <span className="hero-cheese">🧀</span>
              <span className="hero-milk">🥛</span>
              <Milk className="hero-milk-outline" strokeWidth={1.1} />
            </div>
          </section>

          {error && <div className="dashboard-error" role="alert">{error}</div>}

          <section className="dashboard-stats" aria-label={isDari ? "آمار کلی" : "Key figures"}>
            {stats.map(({ title, value, unit, Icon, tone }) => (
              <article className="dashboard-stat-card" key={title}>
                <div className={`stat-icon-wrap ${tone}`}><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></div>
                <div className="stat-card-content">
                  <span className="dashboard-stat-title">{title}</span>
                  <strong className="dashboard-stat-value">{value}</strong>
                  <span className="dashboard-stat-unit">{unit}</span>
                </div>
                <ArrowUpRight className="stat-card-arrow" size={17} aria-hidden="true" />
              </article>
            ))}
          </section>

          <section className="dashboard-charts">
            <article className="dashboard-panel sales-chart-panel">
              <div className="panel-heading">
                <div><h2>{isDari ? "فروش در هفت روز اخیر" : "Sales over the last 7 days"}</h2><p>{isDari ? "مجموع فروش ثبت‌شده در هر روز" : "Recorded sales by day"}</p></div>
                <span className="panel-heading-icon blue"><ChartNoAxesCombined size={18} aria-hidden="true" /></span>
              </div>
              {salesUnavailable ? (
                <div className="chart-empty">{isDari ? "اطلاعات فروش در دسترس نیست." : "Sales data is unavailable."}</div>
              ) : (
                <div className="sales-chart" role="img" aria-label={isDari ? "نمودار مجموع فروش روزانه" : "Daily sales chart"}>
                  <div className="chart-y-labels"><span>{formatNumber(maxDailySales)}</span><span>{formatNumber(maxDailySales * 0.66)}</span><span>{formatNumber(maxDailySales * 0.33)}</span><span>0</span></div>
                  <div className="chart-plot">
                    <div className="chart-grid-lines"><i /><i /><i /><i /></div>
                    <div className="chart-bars">
                      {weekDays.map(({ date, amount, label }) => (
                        <div className="chart-bar-column" key={date.toISOString()}>
                          <span className="chart-bar-value">{amount ? formatNumber(amount) : ""}</span>
                          <div className="chart-bar-track"><span className="chart-bar" style={{ height: `${amount ? Math.max((amount / maxDailySales) * 100, 5) : 0}%` }} /></div>
                          <span className="chart-bar-label">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </article>

            <article className="dashboard-panel category-panel">
              <div className="panel-heading">
                <div><h2>{isDari ? "دسته‌بندی محصولات" : "Product categories"}</h2><p>{isDari ? "ترکیب موجودی بر اساس دسته" : "Inventory mix by category"}</p></div>
                <span className="panel-heading-icon purple"><Boxes size={18} aria-hidden="true" /></span>
              </div>
              {productsUnavailable ? (
                <div className="chart-empty">{isDari ? "اطلاعات محصولات در دسترس نیست." : "Product data is unavailable."}</div>
              ) : categoryData.length ? (
                <div className="category-chart-content">
                  <div className="category-donut" style={{ background: `conic-gradient(${pieSegments.join(", ")})` }}><span><strong>{formatNumber(categoryTotal)}</strong><small>{isDari ? "محصول" : "items"}</small></span></div>
                  <div className="category-legend">
                    {categoryData.map(({ name, count }, index) => (
                      <div className="category-legend-row" key={name}>
                        <span className="category-color" style={{ background: chartColors[index] }} />
                        <span className="category-name">{name}</span>
                        <strong>{categoryTotal ? Math.round((count / categoryTotal) * 100) : 0}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <div className="chart-empty">{isDari ? "هنوز محصولی ثبت نشده است." : "No products have been added yet."}</div>}
            </article>
          </section>

          <section className="dashboard-bottom-panels">
            <article className="dashboard-panel activity-panel">
              <div className="panel-heading">
                <div><h2>{isDari ? "آخرین فروش‌ها" : "Recent sales"}</h2><p>{isDari ? "تازه‌ترین معاملات ثبت‌شده" : "Latest recorded transactions"}</p></div>
                <Link className="panel-link" to="/sales">{isDari ? "مشاهده همه" : "View all"} <ArrowLeft size={14} aria-hidden="true" /></Link>
              </div>
              {salesUnavailable ? (
                <div className="chart-empty">{isDari ? "اطلاعات فروش در دسترس نیست." : "Sales data is unavailable."}</div>
              ) : latestSales.length ? (
                <div className="dashboard-table-wrap">
                  <table className="dashboard-table">
                    <thead><tr><th>{isDari ? "مشتری" : "Customer"}</th><th>{isDari ? "تاریخ" : "Date"}</th><th>{isDari ? "مبلغ فروش" : "Sale amount"}</th></tr></thead>
                    <tbody>{latestSales.map((sale) => (
                      <tr key={sale.id}>
                        <td><span className="table-customer-icon"><Receipt size={15} aria-hidden="true" /></span>{sale.customer?.name || (isDari ? "مشتری حضوری" : "Walk-in customer")}</td>
                        <td>{new Date(sale.saleDate).toLocaleDateString(isDari ? "fa-AF" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                        <td className="table-amount">{formatMoney(sale.totalAmount)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <div className="chart-empty">{isDari ? "هنوز فروشی ثبت نشده است." : "No sales have been recorded yet."}</div>}
            </article>

            <article className="dashboard-panel inventory-panel">
              <div className="panel-heading">
                <div><h2>{isDari ? "وضعیت موجودی" : "Inventory status"}</h2><p>{isDari ? "محصولات با کمترین موجودی" : "Products with the lowest stock"}</p></div>
                <Link className="panel-link" to={isAdmin ? "/products" : "/shop/products"}>{isDari ? "همه محصولات" : "All products"} <ArrowLeft size={14} aria-hidden="true" /></Link>
              </div>
              {productsUnavailable ? (
                <div className="chart-empty">{isDari ? "اطلاعات محصولات در دسترس نیست." : "Product data is unavailable."}</div>
              ) : lowestStockProducts.length ? (
                <div className="inventory-list">
                  {lowestStockProducts.map((product) => (
                    <div className="inventory-row" key={product.id}>
                      <span className="inventory-product-icon"><Milk size={18} aria-hidden="true" /></span>
                      <span className="inventory-product-info"><strong>{product.name}</strong><small>{product.category || (isDari ? "بدون دسته‌بندی" : "Uncategorised")}</small></span>
                      <span className={`inventory-quantity ${Number(product.stock) <= 10 ? "low" : ""}`}>{formatNumber(product.stock, 2)} <small>{product.unit}</small></span>
                    </div>
                  ))}
                </div>
              ) : <div className="chart-empty">{isDari ? "هنوز محصولی ثبت نشده است." : "No products have been added yet."}</div>}
            </article>
          </section>

          <footer className="dashboard-footer"><span>© 2025 Dairy Management. {isDari ? "تمام حقوق محفوظ است." : "All rights reserved."}</span><span>{isDari ? "کیفیت، اعتماد، رشد" : "Quality · Trust · Growth"}</span></footer>
        </main>

        <aside className="dashboard-quick-panel">
          <div className="quick-panel-heading"><h2>{isDari ? "عملیات سریع" : "Quick actions"}</h2><Zap size={17} aria-hidden="true" /></div>
          {quickLinks.map(({ to, label, Icon, color }) => (
            <Link className={`quick-action ${color}`} to={to} key={to}>
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
              <Plus className="quick-action-plus" size={15} aria-hidden="true" />
            </Link>
          ))}
          <div className="quick-summary">
            <div className="quick-summary-icon"><CircleCheck size={17} aria-hidden="true" /></div>
            <strong>{isDari ? "سیستم فعال است" : "System is active"}</strong>
            <span>{isDari ? "اطلاعات شما به‌روز است" : "Your dashboard is up to date"}</span>
            <div className="quick-summary-stats"><span>{isDari ? "مجموع خرید شیر" : "Milk purchases"}</span><strong>{formatMoney(data.totalPurchases)}</strong></div>
            <div className="quick-summary-stats"><span>{isDari ? "سود خالص" : "Net profit"}</span><strong className={data.profit < 0 ? "negative" : ""}>{formatMoney(data.profit)}</strong></div>
          </div>
          <div className="quick-panel-bottom"><span className="bottom-milk-icon"><Milk size={25} aria-hidden="true" /></span><strong>{isDari ? "لبنیات سالم" : "Fresh dairy"}</strong><span>{isDari ? "زندگی سالم" : "A healthier life"}</span><span className="bottom-heart">♥</span></div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
