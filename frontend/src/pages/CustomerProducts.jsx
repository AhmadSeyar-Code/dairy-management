import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";
import { getCart, saveCart } from "../utils/cart";

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " AFN";

function CustomerProducts() {
  const { language } = useLanguage();
  const isPersian = language === "fa";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  const addToCart = (product) => {
    const current = getCart();
    const found = current.find((item) => item.productId === product.id);
    const currentQuantity = Number(found?.quantity || 0);
    const increment = Math.min(1, Math.max(0, Number(product.stock) - currentQuantity));
    const nextQuantity = currentQuantity + increment;
    if (increment <= 0 || nextQuantity > Number(product.stock)) {
      setError(isPersian ? "موجودی این محصول کافی نیست." : "Not enough stock available.");
      return;
    }
    const updated = found
      ? current.map((item) => item.productId === product.id ? { ...item, quantity: nextQuantity } : item)
      : [...current, { productId: product.id, quantity: 1 }];
    saveCart(updated);
    setError("");
    setNotice(product.name + (isPersian ? " به سبد اضافه شد." : " added to cart."));
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>{isPersian ? "محصولات لبنی" : "Dairy Products"}</h1><p>{isPersian ? "محصولات موجود را انتخاب و به سبد اضافه کنید." : "Choose available products and add them to your cart."}</p></div>
        <Link className="btn-primary" to="/cart">{isPersian ? "سبد خرید" : "Shopping cart"}</Link>
      </div>
      {error && <div className="content-card customer-message customer-error">{error}</div>}
      {notice && <div className="content-card customer-message customer-success">{notice}</div>}
      {loading ? <div className="content-card content-card-body">{isPersian ? "در حال بارگذاری..." : "Loading products..."}</div> : products.length === 0 ? (
        <div className="content-card content-card-body">{isPersian ? "محصولی در دسترس نیست." : "No products are available."}</div>
      ) : (
        <div className="customer-product-grid">
          {products.map((product) => {
            const stock = Number(product.stock || 0);
            return (
              <article className="customer-product-card" key={product.id}>
                {product.imageUrl ? <img className="customer-product-image" src={product.imageUrl} alt={product.name} /> : <div className="customer-product-placeholder">🥛</div>}
                <div className="customer-product-content">
                  <span className="customer-product-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{isPersian ? "واحد" : "Unit"}: {product.unit}</p>
                  <div className="customer-product-price">{money(product.sellPrice)}</div>
                  <div className={stock > 0 ? "customer-stock available" : "customer-stock unavailable"}>
                    {stock > 0 ? (isPersian ? "موجود" : "In stock") + ": " + stock : (isPersian ? "ناموجود" : "Out of stock")}
                  </div>
                  <button className="btn-primary" type="button" disabled={stock <= 0} onClick={() => addToCart(product)}>
                    {isPersian ? "افزودن به سبد" : "Add to cart"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomerProducts;
