import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import { ORDER_STATUSES, orderMoney, statusColor, statusLabel } from "../utils/orderUi";

function CustomerOrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.submitted ? (isPersian ? "سفارش شما ثبت شد." : "Your order was submitted.") : "");

  useEffect(() => {
    let active = true;
    api.get("/orders/mine/" + id)
      .then(({ data }) => { if (active) setOrder(data); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || (isPersian ? "دریافت سفارش ناموفق بود." : "Failed to load order."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isPersian]);

  const cancel = async () => {
    if (!window.confirm(isPersian ? "آیا می‌خواهید این سفارش را لغو کنید؟" : "Cancel this order?")) return;
    try {
      const { data } = await api.post("/orders/mine/" + id + "/cancel");
      setOrder(data);
      setSuccess(isPersian ? "سفارش لغو شد." : "Order cancelled.");
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || (isPersian ? "لغو سفارش ناموفق بود." : "Failed to cancel order."));
    }
  };

  if (loading) return <div className="content-card content-card-body">{isPersian ? "در حال بارگذاری..." : "Loading order..."}</div>;
  if (error && !order) return <div className="content-card customer-message customer-error">{error}</div>;
  if (!order) return null;

  const currentStep = ORDER_STATUSES.indexOf(order.status);
  return (
    <div>
      <div className="page-header"><div><h1>{isPersian ? "سفارش" : "Order"} #{order.id}</h1><p>{new Date(order.createdAt).toLocaleString(isPersian ? "fa-AF" : undefined)}</p></div><Link to="/customer/orders">{isPersian ? "بازگشت به سفارش‌ها" : "Back to orders"}</Link></div>
      {success && <div className="content-card customer-message customer-success">{success}</div>}
      {error && <div className="content-card customer-message customer-error">{error}</div>}
      <div className="content-card customer-order-detail-card">
        <h3>{isPersian ? "وضعیت سفارش" : "Order status"}</h3>
        {order.status === "cancelled" ? <span className="customer-status" style={{ color: statusColor(order.status) }}>{statusLabel(order.status, isPersian)}</span> : (
          <div className="order-tracking-steps">
            {ORDER_STATUSES.filter((status) => status !== "cancelled").map((status) => {
              const step = ORDER_STATUSES.indexOf(status);
              return <div className={"order-tracking-step " + (step <= currentStep ? "complete" : "")} key={status}><span>{step + 1}</span><small>{statusLabel(status, isPersian)}</small></div>;
            })}
          </div>
        )}
      </div>
      <div className="content-card customer-order-detail-card">
        <h3>{isPersian ? "محصولات سفارش" : "Ordered products"}</h3>
        <div className="table-container"><table><thead><tr><th>{isPersian ? "محصول" : "Product"}</th><th>{isPersian ? "تعداد" : "Quantity"}</th><th>{isPersian ? "قیمت واحد" : "Unit price"}</th><th>{isPersian ? "مجموع" : "Subtotal"}</th></tr></thead><tbody>
          {order.items.map((item) => <tr key={item.id}><td>{item.productName || item.product?.name || (isPersian ? "محصول" : "Product")}</td><td>{Number(item.quantity)} {item.unit || item.product?.unit}</td><td>{orderMoney(item.unitPrice)}</td><td>{orderMoney(item.subtotal)}</td></tr>)}
        </tbody></table></div>
        <div className="customer-order-grand-total"><strong>{isPersian ? "مجموع کل" : "Total"}</strong><strong>{orderMoney(order.totalAmount)}</strong></div>
      </div>
      <div className="content-card customer-order-detail-card">
        <h3>{isPersian ? "اطلاعات تحویل" : "Delivery details"}</h3>
        <p><strong>{isPersian ? "نام" : "Name"}:</strong> {order.customer?.name}</p>
        <p><strong>{isPersian ? "تماس" : "Phone"}:</strong> {order.phone}</p>
        <p><strong>{isPersian ? "آدرس" : "Address"}:</strong> {order.deliveryAddress}</p>
        {order.notes && <p><strong>{isPersian ? "یادداشت" : "Notes"}:</strong> {order.notes}</p>}
      </div>
      {order.status === "pending" && <button className="customer-cancel-button" type="button" onClick={cancel}>{isPersian ? "لغو سفارش" : "Cancel order"}</button>}
    </div>
  );
}

export default CustomerOrderDetails;
