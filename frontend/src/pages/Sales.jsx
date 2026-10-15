import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function Sales() {
  const { language } = useLanguage();
  const isPersian = language === "fa";

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customerId, setCustomerId] = useState("");

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: "",
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadSalesData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, customersResponse, salesResponse] =
          await Promise.all([
            api.get("/products"),
            api.get("/customers"),
            api.get("/sales"),
          ]);

        if (!isMounted) return;

        setProducts(
          Array.isArray(productsResponse.data) ? productsResponse.data : [],
        );

        setCustomers(
          Array.isArray(customersResponse.data) ? customersResponse.data : [],
        );

        setSales(Array.isArray(salesResponse.data) ? salesResponse.data : []);
      } catch (requestError) {
        console.error(requestError);

        if (!isMounted) return;

        setError(
          isPersian
            ? "دریافت اطلاعات فروش ناموفق بود."
            : "Failed to load sales data.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSalesData();

    return () => {
      isMounted = false;
    };
  }, [isPersian]);

  const loadSales = async () => {
    try {
      const response = await api.get("/sales");

      setSales(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "دریافت فروش‌ها ناموفق بود." : "Failed to load sales."),
      );
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const resetForm = () => {
    setCustomerId("");

    setItems([
      {
        productId: "",
        quantity: "",
      },
    ]);
  };

  const getProduct = (productId) => {
    return products.find((product) => product.id === Number(productId));
  };

  const getItemTotal = (item) => {
    const product = getProduct(item.productId);

    if (!product) return 0;

    return Number(item.quantity || 0) * Number(product.sellPrice || 0);
  };

  const grandTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        setError(
          isPersian
            ? "لطفاً محصول و مقدار را برای تمام ردیف‌ها انتخاب کنید."
            : "Please select product and quantity for all items.",
        );
        return;
      }

      const product = getProduct(item.productId);

      if (!product) {
        setError(
          isPersian
            ? "محصول انتخاب‌شده پیدا نشد."
            : "Selected product was not found.",
        );
        return;
      }

      if (Number(item.quantity) > Number(product.stock)) {
        setError(
          isPersian
            ? `موجودی ${product.name} کافی نیست. موجودی فعلی: ${product.stock}`
            : `Not enough stock for ${product.name}. Available: ${product.stock}`,
        );
        return;
      }

      if (Number(item.quantity) <= 0) {
        setError(
          isPersian
            ? "مقدار باید بیشتر از صفر باشد."
            : "Quantity must be greater than zero.",
        );
        return;
      }
    }

    try {
      setSaving(true);

      const saleItems = items.map((item) => {
        const product = getProduct(item.productId);

        return {
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price: Number(product.sellPrice),
        };
      });

      await api.post("/sales", {
        customerId: customerId ? Number(customerId) : null,
        items: saleItems,
      });

      resetForm();

      await loadSales();

      const productsResponse = await api.get("/products");

      setProducts(
        Array.isArray(productsResponse.data) ? productsResponse.data : [],
      );
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "ثبت فروش ناموفق بود." : "Failed to create sale."),
      );
    } finally {
      setSaving(false);
    }
  };

  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount || 0),
    0,
  );

  return (
    <div>
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>{isPersian ? "فروش" : "Sales"}</h1>

          <p>
            {isPersian
              ? "ثبت و مدیریت فروش محصولات"
              : "Create and manage product sales"}
          </p>
        </div>
      </div>

      {/* STATS */}

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-title">
              {isPersian ? "تعداد فروش" : "Total Sales"}
            </span>

            <span className="stat-icon">◇</span>
          </div>

          <div className="stat-value">{sales.length}</div>

          <div className="stat-subtitle">
            {isPersian ? "فروش ثبت‌شده" : "Recorded sales"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-title">
              {isPersian ? "درآمد فروش" : "Sales Revenue"}
            </span>

            <span className="stat-icon">◉</span>
          </div>

          <div className="stat-value">{totalSales.toFixed(2)}</div>

          <div className="stat-subtitle">AFN</div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="content-card"
          style={{
            marginTop: "20px",
            padding: "15px",
            color: "#c53030",
            background: "#fff5f5",
          }}
        >
          {error}
        </div>
      )}

      {/* SALE FORM */}

      <div className="form-card" style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: 0 }}>
            {isPersian ? "ثبت فروش جدید" : "Create New Sale"}
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              color: "#718096",
              fontSize: "12px",
            }}
          >
            {isPersian
              ? "مشتری و محصولات فروخته‌شده را انتخاب کنید."
              : "Select customer and products."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* CUSTOMER */}

          <div className="form-group">
            <label>{isPersian ? "مشتری" : "Customer"}</label>

            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">
                {isPersian ? "مشتری عمومی" : "Walk-in Customer"}
              </option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* ITEMS */}

          <div style={{ marginTop: "25px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
                gap: "10px",
              }}
            >
              <h4 style={{ margin: 0 }}>
                {isPersian ? "محصولات" : "Products"}
              </h4>

              <button
                type="button"
                className="btn-primary"
                onClick={addItem}
                style={{
                  width: "auto",
                  padding: "9px 14px",
                }}
              >
                + {isPersian ? "محصول" : "Add Product"}
              </button>
            </div>

            {items.map((item, index) => {
              const product = getProduct(item.productId);

              const itemTotal = getItemTotal(item);

              return (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr auto",
                    gap: "12px",
                    alignItems: "end",
                    marginBottom: "12px",
                  }}
                >
                  <div className="form-group">
                    <label>{isPersian ? "محصول" : "Product"}</label>

                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, "productId", e.target.value)
                      }
                      required
                    >
                      <option value="">
                        {isPersian ? "انتخاب محصول" : "Select product"}
                      </option>

                      {products.map((productItem) => (
                        <option key={productItem.id} value={productItem.id}>
                          {productItem.name} —{" "}
                          {Number(productItem.stock).toFixed(2)}{" "}
                          {productItem.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{isPersian ? "مقدار" : "Quantity"}</label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{isPersian ? "مجموع" : "Subtotal"}</label>

                    <input
                      type="text"
                      value={`${itemTotal.toFixed(2)} AFN`}
                      readOnly
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    style={{
                      height: "44px",
                      padding: "0 13px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: items.length === 1 ? "not-allowed" : "pointer",
                      color: "#dc4c4c",
                      background: "#fff0f0",
                    }}
                  >
                    ×
                  </button>

                  {product && (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        marginTop: "-5px",
                        fontSize: "11px",
                        color: "#718096",
                      }}
                    >
                      {isPersian
                        ? `موجودی: ${product.stock} ${product.unit} | قیمت فروش: ${product.sellPrice} AFN`
                        : `Stock: ${product.stock} ${product.unit} | Sale price: ${product.sellPrice} AFN`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TOTAL */}

          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              borderRadius: "10px",
              background: "#e8f7f1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <strong>{isPersian ? "مجموع فروش" : "Grand Total"}</strong>

            <strong
              style={{
                fontSize: "22px",
                color: "#087f5b",
              }}
            >
              {grandTotal.toFixed(2)} AFN
            </strong>
          </div>

          {/* SUBMIT */}

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving
                ? isPersian
                  ? "در حال ثبت..."
                  : "Saving..."
                : isPersian
                  ? "ثبت فروش"
                  : "Complete Sale"}
            </button>
          </div>
        </form>
      </div>

      {/* SALES HISTORY */}

      <div className="content-card" style={{ marginTop: "20px" }}>
        <div className="content-card-header">
          <div>
            <h3>{isPersian ? "تاریخچه فروش" : "Sales History"}</h3>

            <span
              style={{
                color: "#718096",
                fontSize: "11px",
              }}
            >
              {isPersian ? "تمام فروش‌های ثبت‌شده" : "All recorded sales"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="content-card-body">
            {isPersian ? "در حال بارگذاری..." : "Loading..."}
          </div>
        ) : sales.length === 0 ? (
          <div className="content-card-body">
            {isPersian ? "هنوز فروشی ثبت نشده است." : "No sales found."}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  <th>{isPersian ? "مشتری" : "Customer"}</th>

                  <th>{isPersian ? "محصولات" : "Products"}</th>

                  <th>{isPersian ? "مجموع" : "Total"}</th>

                  <th>{isPersian ? "تاریخ" : "Date"}</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale, index) => (
                  <tr key={sale.id}>
                    <td>{index + 1}</td>

                    <td>
                      {sale.customer?.name ||
                        (isPersian ? "مشتری عمومی" : "Walk-in")}
                    </td>

                    <td>
                      {sale.items
                        ?.map(
                          (item) =>
                            `${item.product?.name || "-"} × ${item.quantity}`,
                        )
                        .join(", ") || "-"}
                    </td>

                    <td>
                      <strong>
                        {Number(sale.totalAmount || 0).toFixed(2)} AFN
                      </strong>
                    </td>

                    <td>
                      {sale.saleDate
                        ? new Date(sale.saleDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;
