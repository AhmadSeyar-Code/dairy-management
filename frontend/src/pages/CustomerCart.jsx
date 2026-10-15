import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import { getCart, saveCart } from "../utils/cart";

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " AFN";

function CustomerCart() {
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const [cart, setCart] = useState(getCart);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/products")
      .then(({ data }) => { if (active) setProducts(Array.isArray(data) ? data : []); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || (isPersian ? "دریافت محصولات ناموفق بود." : "Failed to load products."));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isPersian]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const rows = cart.map((item) => ({ ...item, product: productById.get(item.productId) }));
  const total = rows.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.product?.sellPrice || 0), 0);
  const canCheckout = rows.length > 0 && rows.every((row) => row.product && Number(row.quantity) > 0 && Number(row.quantity) <= Number(row.product.stock));

  const persist = (next) => {
    setCart(next);
    saveCart(next);
  };
  const updateQuantity = (productId, value) => {
    const quantity = Number(value);
    const product = productById.get(productId);
    if (!Number.isFinite(quantity) || quantity <= 0 || !product || quantity > Number(product.stock)) return;
    persist(cart.map((item) => item.productId === productId ? { ...item, quantity } : item));
  };
  const remove = (productId) => persist(cart.filter((item) => item.productId !== productId));

  return (
    <div>
      <div className="page-header"><div><h1>{isPersian ? "سبد خرید" : "Shopping Cart"}</h1><p>{isPersian ? "مقدار محصولات را بررسی کنید." : "Review product quantities before checkout."}</p></div><Link to="/shop/products">{isPersian ? "ادامه خرید" : "Continue shopping"}</Link></div>
      {error && <div className="content-card customer-message customer-error">{error}</div>}
      {loading ? <div className="content-card content-card-body">{isPersian ? "در حال بارگذاری..." : "Loading cart..."}</div> : rows.length === 0 ? (
        <div className="content-card content-card-body">{isPersian ? "سبد خرید خالی است." : "Your cart is empty."} <Link to="/shop/products">{isPersian ? "مشاهده محصولات" : "Browse products"}</Link></div>
      ) : (
        <div className="customer-cart-layout">
          <div className="content-card">
            {rows.map((row) => (
              <div className="customer-cart-row" key={row.productId}>
                <div className="customer-cart-product">
                  <strong>{row.product?.name || (isPersian ? "محصول حذف شده" : "Product unavailable")}</strong>
                  <span>{row.product ? money(row.product.sellPrice) + " / " + row.product.unit : "—"}</span>
                </div>
                <label className="customer-quantity">
                  <span>{isPersian ? "تعداد" : "Quantity"}</span>
                  <input type="number" min="0.01" step="0.01" max={row.product?.stock} value={row.quantity} onChange={(event) => updateQuantity(row.productId, event.target.value)} />
                </label>
                <strong>{row.product ? money(Number(row.quantity) * Number(row.product.sellPrice)) : "—"}</strong>
                <button type="button" className="customer-remove-button" onClick={() => remove(row.productId)}>{isPersian ? "حذف" : "Remove"}</button>
                {row.product && Number(row.quantity) > Number(row.product.stock) && <span className="customer-stock unavailable">{isPersian ? "موجودی کافی نیست" : "Insufficient stock"}</span>}
              </div>
            ))}
          </div>
          <aside className="content-card customer-cart-total">
            <h3>{isPersian ? "مجموع سفارش" : "Order Summary"}</h3>
            <div><span>{isPersian ? "جمع کل" : "Subtotal"}</span><strong>{money(total)}</strong></div>
            <p>{isPersian ? "هزینهٔ تحویل هنگام تماس تأیید می‌شود." : "Delivery details are confirmed separately."}</p>
            <Link className="btn-primary" aria-disabled={!canCheckout} to={canCheckout ? "/checkout" : "#"} onClick={(event) => { if (!canCheckout) event.preventDefault(); }}>
              {isPersian ? "ادامه به پرداخت" : "Proceed to checkout"}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CustomerCart;
