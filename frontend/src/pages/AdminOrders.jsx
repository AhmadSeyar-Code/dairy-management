import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import { ORDER_STATUSES, orderMoney, statusColor, statusLabel } from "../utils/orderUi";

const nextStatuses = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

function AdminOrders() {
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const [orders, setOrders] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    api.get("/orders")
      .then(({ data }) => {
        if (!active) return;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || (isPersian ? "دریافت سفارش‌ها ناموفق بود." : "Failed to load orders."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isPersian]);

  const updateStatus = async (order) => {
    const status = selectedStatuses[order.id];
    if (!status || status === order.status) return;
    if (status === "cancelled" && !window.confirm(isPersian ? "آیا سفارش را لغو می‌کنید؟" : "Cancel this order?")) return;
    setSavingId(order.id);
    setError("");
    setSuccess("");
    try {
      const { data: updatedOrder } = await api.patch("/orders/" + order.id + "/status", { status });
      setSuccess((isPersian ? "وضعیت سفارش " : "Order #") + order.id + (isPersian ? " به‌روز شد." : " status updated."));
      setOrders((current) => current.map((item) => item.id === updatedOrder.id ? updatedOrder : item));
      setSelectedStatuses((current) => ({ ...current, [updatedOrder.id]: updatedOrder.status }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || (isPersian ? "به‌روزرسانی سفارش ناموفق بود." : "Failed to update order."));
    } finally {
      setSavingId(null);
    }
  };

  const shownOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter);

  return (
    <div>
      <div className="page-header">
        <div><h1>{isPersian ? "مدیریت سفارش‌ها" : "Order Management"}</h1><p>{isPersian ? "سفارش‌های مشتریان را بررسی و وضعیت تحویل را مدیریت کنید." : "Review customer orders and manage fulfillment."}</p></div>
        <span className="badge badge-success">{orders.length} {isPersian ? "سفارش" : "orders"}</span>
      </div>
      {error && <div className="content-card customer-message customer-error">{error}</div>}
      {success && <div className="content-card customer-message customer-success">{success}</div>}
      <div className="content-card order-filter-bar">
        <label>{isPersian ? "وضعیت" : "Status"}
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">{isPersian ? "همه" : "All"}</option>
            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status, isPersian)}</option>)}
          </select>
        </label>
      </div>
      {loading ? <div className="content-card content-card-body">{isPersian ? "در حال بارگذاری..." : "Loading orders..."}</div> : shownOrders.length === 0 ? (
        <div className="content-card content-card-body">{isPersian ? "سفارشی پیدا نشد." : "No orders found."}</div>
      ) : (
        <div className="admin-order-list">
          {shownOrders.map((order) => (
            <article className="content-card admin-order-card" key={order.id}>
              <div className="admin-order-heading">
                <div><h3>#{order.id} · {order.customer?.name || "—"}</h3><span>{order.customer?.user?.email || "—"} · {order.phone}</span></div>
                <span className="customer-status" style={{ color: statusColor(order.status) }}>{statusLabel(order.status, isPersian)}</span>
              </div>
              <div className="admin-order-summary">
                <span>{isPersian ? "ثبت:" : "Placed:"} {new Date(order.createdAt).toLocaleString(isPersian ? "fa-AF" : undefined)}</span>
                <strong>{orderMoney(order.totalAmount)}</strong>
              </div>
              <details className="admin-order-details">
                <summary>{isPersian ? "مشاهدهٔ جزئیات سفارش" : "View order details"}</summary>
                <div className="admin-order-contact">
                  <p><strong>{isPersian ? "تماس" : "Phone"}:</strong> {order.phone}</p>
                  <p><strong>{isPersian ? "آدرس تحویل" : "Delivery address"}:</strong> {order.deliveryAddress}</p>
                  {order.notes && <p><strong>{isPersian ? "یادداشت" : "Notes"}:</strong> {order.notes}</p>}
                </div>
                <div className="table-container"><table><thead><tr><th>{isPersian ? "محصول" : "Product"}</th><th>{isPersian ? "مقدار" : "Quantity"}</th><th>{isPersian ? "قیمت واحد" : "Unit price"}</th><th>{isPersian ? "مجموع" : "Subtotal"}</th></tr></thead><tbody>
                  {order.items.map((item) => <tr key={item.id}><td>{item.productName || item.product?.name || "—"}</td><td>{Number(item.quantity)} {item.unit || item.product?.unit}</td><td>{orderMoney(item.unitPrice)}</td><td>{orderMoney(item.subtotal)}</td></tr>)}
                </tbody></table></div>
              </details>
              {nextStatuses[order.status].length > 0 && (
                <div className="admin-order-controls">
                  <label>{isPersian ? "تغییر وضعیت" : "Update status"}
                    <select value={selectedStatuses[order.id] || order.status} onChange={(event) => setSelectedStatuses((current) => ({ ...current, [order.id]: event.target.value }))}>
                      <option value={order.status}>{statusLabel(order.status, isPersian)}</option>
                      {nextStatuses[order.status].map((status) => <option key={status} value={status}>{statusLabel(status, isPersian)}</option>)}
                    </select>
                  </label>
                  <button className="btn-primary" type="button" disabled={savingId === order.id || !selectedStatuses[order.id] || selectedStatuses[order.id] === order.status} onClick={() => updateStatus(order)}>
                    {savingId === order.id ? (isPersian ? "در حال ذخیره..." : "Saving...") : (isPersian ? "ذخیره وضعیت" : "Save status")}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
