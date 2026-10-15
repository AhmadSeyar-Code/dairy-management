import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import { clearCart, getCart } from "../utils/cart";

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " AFN";

function CustomerCheckout() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const cart = useMemo(() => getCart(), []);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", deliveryAddress: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/orders/profile"), api.get("/products")])
      .then(([profileResponse, productsResponse]) => {
        if (!active) return;
        const profile = profileResponse.data;
        setForm((current) => ({ ...current, name: profile.name || "", phone: profile.phone || "", deliveryAddress: profile.address || "" }));
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || (isPersian ? "آماده‌سازی صفحهٔ سفارش ناموفق بود." : "Failed to prepare checkout."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isPersian]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const rows = cart.map((item) => ({ ...item, product: productById.get(item.productId) }));
  const total = rows.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.product?.sellPrice || 0), 0);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!cart.length) {
      setError(isPersian ? "سبد خرید خالی است." : "Your cart is empty.");
      return;
    }
    if (rows.some((row) => !row.product || Number(row.quantity) > Number(row.product.stock))) {
      setError(isPersian ? "موجودی محصولات تغییر کرده است؛ سبد را بررسی کنید." : "Product stock changed. Please review your cart.");
      return;
    }
    setSaving(true);
    try {
      const { data: order } = await api.post("/orders", {
        ...form,
        items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
      });
      clearCart();
      navigate("/customer/orders/" + order.id, { state: { submitted: true } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || (isPersian ? "ثبت سفارش ناموفق بود." : "Failed to place the order."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="content-card content-card-body">{isPersian ? "در حال بارگذاری..." : "Preparing checkout..."}</div>;
  if (!cart.length) return <div className="content-card content-card-body">{isPersian ? "سبد خرید خالی است." : "Your cart is empty."} <Link to="/shop/products">{isPersian ? "مشاهده محصولات" : "Browse products"}</Link></div>;

  return (
    <div>
      <div className="page-header"><div><h1>{isPersian ? "ثبت سفارش" : "Checkout"}</h1><p>{isPersian ? "اطلاعات تحویل را وارد کنید." : "Enter delivery contact information."}</p></div></div>
      {error && <div className="content-card customer-message customer-error">{error}</div>}
      <form className="customer-checkout-layout" onSubmit={submit}>
        <div className="form-card">
          <div className="form-grid">
            <div className="form-group"><label>{isPersian ? "نام گیرنده" : "Recipient name"}</label><input value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label>{isPersian ? "شماره تماس" : "Phone"}</label><input type="tel" maxLength={40} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
            <div className="form-group customer-full-width"><label>{isPersian ? "آدرس تحویل" : "Delivery address"}</label><textarea rows={3} maxLength={2000} value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} required /></div>
            <div className="form-group customer-full-width"><label>{isPersian ? "یادداشت (اختیاری)" : "Order notes (optional)"}</label><textarea rows={3} maxLength={2000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
        </div>
        <aside className="content-card customer-cart-total">
          <h3>{isPersian ? "خلاصهٔ سفارش" : "Order Summary"}</h3>
          {rows.map((row) => <div className="customer-checkout-line" key={row.productId}><span>{row.product?.name || "—"} × {row.quantity}</span><strong>{row.product ? money(Number(row.quantity) * Number(row.product.sellPrice)) : "—"}</strong></div>)}
          <div className="customer-checkout-grand-total"><span>{isPersian ? "مجموع" : "Total"}</span><strong>{money(total)}</strong></div>
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? (isPersian ? "در حال ثبت..." : "Submitting...") : (isPersian ? "ثبت سفارش" : "Place order")}</button>
        </aside>
      </form>
    </div>
  );
}

export default CustomerCheckout;
