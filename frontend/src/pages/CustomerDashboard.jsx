import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Milk,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import { getCart } from "../utils/cart";
import { orderMoney, statusColor, statusLabel } from "../utils/orderUi";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

function CustomerDashboard() {
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user] = useState(getStoredUser);
  const cartCount = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  useEffect(() => {
    let active = true;
    api.get("/orders/mine")
      .then(({ data }) => { if (active) setOrders(Array.isArray(data) ? data : []); })
      .catch((requestError) => {
        console.error("Failed to load recent customer orders:", requestError);
        if (active) setError(requestError.response?.data?.message || (isPersian ? "دریافت سفارش‌ها ناموفق بود." : "Failed to load orders."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isPersian]);

  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const deliveredOrders = orders.filter((order) => order.status === "delivered");
  const recentOrders = orders.slice(0, 4);
  const featuredOrder = activeOrders[0];
  const dateLocale = isPersian ? "fa-AF" : undefined;
  const DateArrow = isPersian ? ArrowLeft : ArrowRight;
  const HeroArrow = isPersian ? ArrowUpLeft : ArrowUpRight;

  const stats = [
    {
      title: isPersian ? "همهٔ سفارش‌ها" : "Total orders",
      value: orders.length,
      note: isPersian ? "از اولین خرید شما" : "Since your first purchase",
      Icon: ClipboardList,
      tone: "green",
    },
    {
      title: isPersian ? "در حال پیگیری" : "In progress",
      value: activeOrders.length,
      note: isPersian ? "سفارش‌های فعال" : "Active orders",
      Icon: Clock3,
      tone: "amber",
    },
    {
      title: isPersian ? "تحویل‌شده" : "Delivered",
      value: deliveredOrders.length,
      note: isPersian ? "با موفقیت تحویل‌شده" : "Successfully completed",
      Icon: PackageCheck,
      tone: "blue",
    },
  ];

  return (
    <main className="customer-dashboard">
      <header className="customer-dashboard-heading">
        <div>
          <span className="customer-dashboard-eyebrow">
            <span className="customer-live-dot" />
            {isPersian ? "فضای اختصاصی شما" : "YOUR CUSTOMER SPACE"}
          </span>
          <h1>
            {isPersian ? "سلام" : "Welcome"}{user?.name ? `، ${user.name}` : ""}
            <span className="customer-heading-wave" aria-hidden="true"> 👋</span>
          </h1>
          <p>{isPersian ? "خریدهای تازه و سفارش‌هایتان را از اینجا مدیریت کنید." : "Your fresh picks and orders, all in one place."}</p>
        </div>
        <div className="customer-today">
          <CalendarDays size={17} aria-hidden="true" />
          <span>{new Intl.DateTimeFormat(dateLocale, { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span>
        </div>
      </header>

      {error && <div className="content-card customer-message customer-error" role="alert">{error}</div>}

      <section className="customer-dashboard-hero">
        <div className="customer-hero-copy">
          <span className="customer-hero-kicker">
            <Milk size={15} aria-hidden="true" />
            {isPersian ? "تازگی، درست دمِ درِ خانه" : "FRESHNESS, DELIVERED"}
          </span>
          <h2>{isPersian ? "خوبیِ هر روز، با انتخاب‌های تازه شروع می‌شود." : "Make every day a little fresher."}</h2>
          <p>{isPersian ? "محصولات مورد علاقه‌تان را انتخاب کنید و سفارش خود را به‌سادگی ثبت و پیگیری کنید." : "Find your dairy favorites, place an order in a few taps, and follow it every step of the way."}</p>
          <Link className="customer-hero-button" to="/shop/products">
            <ShoppingBag size={18} aria-hidden="true" />
            {isPersian ? "گشت‌وگذار در محصولات" : "Explore products"}
            <HeroArrow size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="customer-hero-art" aria-hidden="true">
          <div className="customer-hero-orbit customer-hero-orbit-one" />
          <div className="customer-hero-orbit customer-hero-orbit-two" />
          <div className="customer-hero-badge"><span>100%</span><small>{isPersian ? "تازگی" : "FRESH"}</small></div>
          <div className="customer-hero-milk"><Milk size={72} strokeWidth={1.25} /></div>
          <span className="customer-hero-sparkle customer-hero-sparkle-one">✦</span>
          <span className="customer-hero-sparkle customer-hero-sparkle-two">✧</span>
        </div>
      </section>

      <section className="customer-dashboard-stats" aria-label={isPersian ? "خلاصه سفارش‌ها" : "Order summary"}>
        {stats.map(({ title, value, note, Icon, tone }) => (
          <article className="customer-dashboard-stat" key={title}>
            <div className={`customer-stat-icon ${tone}`}><Icon size={20} strokeWidth={1.8} aria-hidden="true" /></div>
            <div className="customer-stat-copy">
              <span>{title}</span>
              <strong>{loading ? "—" : value}</strong>
              <small>{note}</small>
            </div>
          </article>
        ))}
      </section>

      <div className="customer-dashboard-content">
        <section className="customer-dashboard-panel customer-recent-panel">
          <div className="customer-panel-heading">
            <div>
              <span className="customer-panel-eyebrow">{isPersian ? "فعالیت حساب" : "ACCOUNT ACTIVITY"}</span>
              <h2>{isPersian ? "سفارش‌های اخیر" : "Recent orders"}</h2>
            </div>
            <Link className="customer-panel-link" to="/customer/orders">
              {isPersian ? "همه سفارش‌ها" : "All orders"}
              <DateArrow size={16} aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="customer-dashboard-loading" aria-live="polite">
              <span /><span /><span />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="customer-dashboard-empty">
              <span className="customer-empty-icon"><ShoppingBag size={23} aria-hidden="true" /></span>
              <strong>{isPersian ? "هنوز سفارشی ثبت نکرده‌اید" : "Your first order is waiting"}</strong>
              <p>{isPersian ? "محصولات تازه را ببینید و اولین سفارش‌تان را ثبت کنید." : "Browse the shop and place your first order whenever you are ready."}</p>
              <Link to="/shop/products">{isPersian ? "مشاهده محصولات" : "Browse products"} <DateArrow size={15} aria-hidden="true" /></Link>
            </div>
          ) : (
            <div className="customer-recent-list">
              {recentOrders.map((order) => (
                <Link className="customer-recent-order" to={`/customer/orders/${order.id}`} key={order.id}>
                  <span className="customer-order-symbol"><ShoppingBag size={18} aria-hidden="true" /></span>
                  <span className="customer-recent-main">
                    <strong>{isPersian ? "سفارش" : "Order"} <bdi>#{order.id}</bdi></strong>
                    <small>{new Date(order.createdAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })} <span>·</span> {order.items?.length || 0} {isPersian ? "قلم" : "items"}</small>
                  </span>
                  <span className="customer-recent-meta">
                    <strong>{orderMoney(order.totalAmount)}</strong>
                    <small className="customer-order-pill" style={{ "--order-tone": statusColor(order.status) }}>
                      <span />{statusLabel(order.status, isPersian)}
                    </small>
                  </span>
                  <DateArrow className="customer-recent-arrow" size={17} aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="customer-dashboard-side">
          <section className="customer-dashboard-panel customer-quick-panel">
            <div className="customer-panel-heading">
              <div>
                <span className="customer-panel-eyebrow">{isPersian ? "میان‌برها" : "QUICK ACCESS"}</span>
                <h2>{isPersian ? "دسترسی سریع" : "Quick actions"}</h2>
              </div>
            </div>
            <div className="customer-quick-links">
              <Link className="customer-quick-link" to="/shop/products">
                <span className="customer-quick-icon shop"><ShoppingBag size={19} aria-hidden="true" /></span>
                <span><strong>{isPersian ? "خرید محصولات" : "Shop products"}</strong><small>{isPersian ? "انتخاب از محصولات موجود" : "Explore what is in stock"}</small></span>
                <DateArrow size={16} aria-hidden="true" />
              </Link>
              <Link className="customer-quick-link" to="/cart">
                <span className="customer-quick-icon cart"><ShoppingCart size={19} aria-hidden="true" /></span>
                <span><strong>{isPersian ? "سبد خرید" : "Your cart"}</strong><small>{cartCount} {isPersian ? "قلم در سبد" : cartCount === 1 ? "item in your cart" : "items in your cart"}</small></span>
                <DateArrow size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className={`customer-dashboard-panel customer-tracking-panel${featuredOrder ? " has-active-order" : ""}`}>
            <span className="customer-tracking-icon">
              {featuredOrder ? <Clock3 size={20} aria-hidden="true" /> : <CheckCircle2 size={20} aria-hidden="true" />}
            </span>
            <span className="customer-panel-eyebrow">{isPersian ? "وضعیت سفارش" : "ORDER STATUS"}</span>
            <h2>{featuredOrder ? (isPersian ? "سفارش شما در جریان است" : "Your order is on its way") : (isPersian ? "همه‌چیز آمادهٔ شروع است" : "Ready when you are")}</h2>
            <p>{featuredOrder
              ? <>{isPersian ? "سفارش" : "Order"} <bdi>#{featuredOrder.id}</bdi> · {statusLabel(featuredOrder.status, isPersian)}</>
              : (isPersian ? "پس از ثبت سفارش، وضعیت آن را همین‌جا پیگیری کنید." : "Place an order and you can follow its progress right here.")}
            </p>
            <Link to={featuredOrder ? `/customer/orders/${featuredOrder.id}` : "/shop/products"}>
              {featuredOrder ? (isPersian ? "پیگیری سفارش" : "Track order") : (isPersian ? "شروع خرید" : "Start shopping")}
              <DateArrow size={16} aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default CustomerDashboard;
