import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import { orderMoney, statusColor, statusLabel } from "../utils/orderUi";

function CustomerOrders() {
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/orders/mine")
      .then(({ data }) => { if (active) setOrders(Array.isArray(data) ? data : []); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || (isPersian ? "دریافت سفارش‌ها ناموفق بود." : "Failed to load orders."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isPersian]);

  const cancelOrder = async (order) => {
    const confirmed = window.confirm(isPersian ? "آیا می‌خواهید این سفارش را لغو کنید؟" : "Cancel this order?");
    if (!confirmed) return;
    setError("");
    setSuccess("");
    try {
      const { data: updatedOrder } = await api.post("/orders/mine/" + order.id + "/cancel");
      setOrders((current) => current.map((item) => item.id === updatedOrder.id ? updatedOrder : item));
      setSuccess(isPersian ? "سفارش لغو شد." : "Order cancelled.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || (isPersian ? "لغو سفارش ناموفق بود." : "Failed to cancel order."));
    }
  };

  return (
    <div>
      <div className="page-header"><div><h1>{isPersian ? "سفارش‌های من" : "My Orders"}</h1><p>{isPersian ? "وضعیت و جزئیات سفارش‌های خود را پیگیری کنید." : "Track your order status and details."}</p></div><Link className="btn-primary" to="/shop/products">{isPersian ? "سفارش جدید" : "Shop products"}</Link></div>
      {error && <div className="content-card customer-message customer-error">{error}</div>}
      {success && <div className="content-card customer-message customer-success">{success}</div>}
      {loading ? <div className="content-card content-card-body">{isPersian ? "در حال بارگذاری..." : "Loading orders..."}</div> : orders.length === 0 ? (
        <div className="content-card content-card-body">{isPersian ? "هنوز سفارشی ثبت نکرده‌اید." : "You have not placed any orders yet."}</div>
      ) : (
        <div className="customer-order-list">
          {orders.map((order) => (
            <article className="content-card customer-order-card" key={order.id}>
              <div className="customer-order-card-head">
                <div><strong>#{order.id}</strong><span>{new Date(order.createdAt).toLocaleString(isPersian ? "fa-AF" : undefined)}</span></div>
                <span className="customer-status" style={{ color: statusColor(order.status) }}>{statusLabel(order.status, isPersian)}</span>
              </div>
              <div className="customer-order-card-body">
                <span>{order.items?.length || 0} {isPersian ? "قلم" : "items"}</span>
                <strong>{orderMoney(order.totalAmount)}</strong>
              </div>
              <div className="customer-order-actions">
                <Link to={"/customer/orders/" + order.id}>{isPersian ? "جزئیات و پیگیری" : "Details & tracking"}</Link>
                {order.status === "pending" && <button type="button" className="customer-remove-button" onClick={() => cancelOrder(order)}>{isPersian ? "لغو سفارش" : "Cancel order"}</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerOrders;
