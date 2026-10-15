import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function MilkPurchases() {
  const { language } = useLanguage();
  const isPersian = language === "fa";

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    supplierId: "",
    quantity: "",
    price: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [purchasesResponse, suppliersResponse] = await Promise.all([
          api.get("/milk-purchases"),
          api.get("/suppliers"),
        ]);

        if (!isMounted) return;

        setPurchases(
          Array.isArray(purchasesResponse.data) ? purchasesResponse.data : [],
        );

        setSuppliers(
          Array.isArray(suppliersResponse.data) ? suppliersResponse.data : [],
        );
      } catch (requestError) {
        console.error(requestError);

        if (!isMounted) return;

        setError(
          isPersian
            ? "دریافت اطلاعات خرید شیر ناموفق بود."
            : "Failed to load milk purchases.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isPersian]);

  const loadPurchases = async () => {
    try {
      const response = await api.get("/milk-purchases");

      setPurchases(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian
            ? "دریافت خریدها ناموفق بود."
            : "Failed to load purchases."),
      );
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      supplierId: "",
      quantity: "",
      price: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/milk-purchases", {
        supplierId: Number(form.supplierId),
        quantity: Number(form.quantity),
        price: Number(form.price),
      });

      resetForm();

      await loadPurchases();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian
            ? "ثبت خرید شیر ناموفق بود."
            : "Failed to create milk purchase."),
      );
    } finally {
      setSaving(false);
    }
  };

  const totalQuantity = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.quantity || 0),
    0,
  );

  const totalCost = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.total || 0),
    0,
  );

  return (
    <div>
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>{isPersian ? "خرید شیر" : "Milk Purchases"}</h1>

          <p>
            {isPersian
              ? "ثبت و مدیریت خرید شیر از تأمین‌کنندگان"
              : "Manage milk purchases from suppliers"}
          </p>
        </div>
      </div>

      {/* STATS */}

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-title">
              {isPersian ? "تعداد خریدها" : "Purchases"}
            </span>

            <span className="stat-icon">◈</span>
          </div>

          <div className="stat-value">{purchases.length}</div>

          <div className="stat-subtitle">
            {isPersian ? "ثبت شده" : "Recorded purchases"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-title">
              {isPersian ? "مجموع شیر" : "Total Milk"}
            </span>

            <span className="stat-icon">🥛</span>
          </div>

          <div className="stat-value">{totalQuantity.toFixed(2)}</div>

          <div className="stat-subtitle">
            {isPersian ? "کیلوگرام" : "Kilograms"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-title">
              {isPersian ? "مجموع هزینه" : "Total Cost"}
            </span>

            <span className="stat-icon">◉</span>
          </div>

          <div className="stat-value">{totalCost.toFixed(2)}</div>

          <div className="stat-subtitle">{isPersian ? "افغانی" : "AFN"}</div>
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

      {/* FORM */}

      <div className="form-card" style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: 0 }}>
            {isPersian ? "ثبت خرید جدید" : "New Milk Purchase"}
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              color: "#718096",
              fontSize: "12px",
            }}
          >
            {isPersian
              ? "تأمین‌کننده، مقدار و قیمت شیر را وارد کنید."
              : "Enter supplier, quantity and price."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>{isPersian ? "تأمین‌کننده" : "Supplier"}</label>

              <select
                name="supplierId"
                value={form.supplierId}
                onChange={handleChange}
                required
              >
                <option value="">
                  {isPersian ? "تأمین‌کننده را انتخاب کنید" : "Select supplier"}
                </option>

                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                {isPersian ? "مقدار شیر (کیلوگرام)" : "Quantity (KG)"}
              </label>

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "قیمت هر کیلو" : "Price per KG"}</label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                required
              />
            </div>
          </div>

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
                  ? "ثبت خرید شیر"
                  : "Record Purchase"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}

      <div className="content-card" style={{ marginTop: "20px" }}>
        <div className="content-card-header">
          <div>
            <h3>{isPersian ? "تاریخچه خرید شیر" : "Milk Purchase History"}</h3>

            <span
              style={{
                color: "#718096",
                fontSize: "11px",
              }}
            >
              {isPersian ? "تمام خریدهای ثبت‌شده" : "All recorded purchases"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="content-card-body">
            {isPersian ? "در حال بارگذاری..." : "Loading..."}
          </div>
        ) : purchases.length === 0 ? (
          <div className="content-card-body">
            {isPersian ? "هنوز خریدی ثبت نشده است." : "No purchases found."}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  <th>{isPersian ? "تأمین‌کننده" : "Supplier"}</th>

                  <th>{isPersian ? "مقدار" : "Quantity"}</th>

                  <th>{isPersian ? "قیمت" : "Price"}</th>

                  <th>{isPersian ? "مجموع" : "Total"}</th>

                  <th>{isPersian ? "تاریخ" : "Date"}</th>
                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase, index) => (
                  <tr key={purchase.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{purchase.supplier?.name || "-"}</strong>
                    </td>

                    <td>{Number(purchase.quantity).toFixed(2)} KG</td>

                    <td>{Number(purchase.price).toFixed(2)} AFN</td>

                    <td>
                      <strong>{Number(purchase.total).toFixed(2)} AFN</strong>
                    </td>

                    <td>
                      {purchase.purchaseDate
                        ? new Date(purchase.purchaseDate).toLocaleDateString()
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

export default MilkPurchases;
