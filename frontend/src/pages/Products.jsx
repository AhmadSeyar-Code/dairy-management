import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function Products() {
  const { language } = useLanguage();
  const isPersian = language === "fa";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "",
    buyPrice: "",
    sellPrice: "",
    stock: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);
      setError(
        isPersian ? "دریافت محصولات ناموفق بود." : "Failed to load products.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    api
      .get("/products")
      .then((response) => {
        if (isMounted) {
          setProducts(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch((requestError) => {
        console.error(requestError);
        if (isMounted) {
          setError(
            isPersian
              ? "\u062f\u0631\u06cc\u0627\u0641\u062a \u0645\u062d\u0635\u0648\u0644\u0627\u062a \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062f."
              : "Failed to load products.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isPersian]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      unit: "",
      buyPrice: "",
      sellPrice: "",
      stock: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post("/products", form);
      }

      resetForm();
      await loadProducts();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "ذخیره محصول ناموفق بود." : "Failed to save product."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      category: product.category || "",
      unit: product.unit || "",
      buyPrice: product.buyPrice || "",
      sellPrice: product.sellPrice || "",
      stock: product.stock || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      isPersian
        ? "آیا از حذف این محصول مطمئن هستید؟"
        : "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);

      await loadProducts();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "حذف محصول ناموفق بود." : "Failed to delete product."),
      );
    }
  };

  return (
    <div>
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>{isPersian ? "محصولات" : "Products"}</h1>

          <p>
            {isPersian
              ? "مدیریت محصولات و موجودی لبنیات"
              : "Manage dairy products and inventory"}
          </p>
        </div>

        <div>
          <span className="badge badge-success">
            {products.length} {isPersian ? "محصول" : "Products"}
          </span>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="content-card"
          style={{
            marginBottom: "20px",
            padding: "15px",
            color: "#c53030",
            background: "#fff5f5",
          }}
        >
          {error}
        </div>
      )}

      {/* FORM */}

      <div className="form-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "10px",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>
              {editingId
                ? isPersian
                  ? "ویرایش محصول"
                  : "Edit Product"
                : isPersian
                  ? "افزودن محصول"
                  : "Add Product"}
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718096",
                fontSize: "12px",
              }}
            >
              {isPersian
                ? "اطلاعات محصول را وارد کنید"
                : "Enter product information"}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              className="sidebar-action"
              style={{
                width: "auto",
                color: "#dc4c4c",
              }}
              onClick={resetForm}
            >
              {isPersian ? "لغو ویرایش" : "Cancel"}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>{isPersian ? "نام محصول" : "Product Name"}</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={isPersian ? "مثلاً شیر" : "e.g. Milk"}
                required
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "دسته‌بندی" : "Category"}</label>

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder={isPersian ? "مثلاً لبنیات" : "e.g. Dairy"}
                required
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "واحد" : "Unit"}</label>

              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                required
              >
                <option value="">
                  {isPersian ? "انتخاب واحد" : "Select unit"}
                </option>

                <option value="liter">{isPersian ? "لیتر" : "Liter"}</option>

                <option value="kg">{isPersian ? "کیلوگرام" : "Kg"}</option>

                <option value="piece">{isPersian ? "دانه" : "Piece"}</option>

                <option value="box">{isPersian ? "بسته" : "Box"}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{isPersian ? "قیمت خرید" : "Buy Price"}</label>

              <input
                type="number"
                name="buyPrice"
                value={form.buyPrice}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "قیمت فروش" : "Sell Price"}</label>

              <input
                type="number"
                name="sellPrice"
                value={form.sellPrice}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "موجودی" : "Stock"}</label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            {editingId && (
              <button
                type="button"
                className="sidebar-action"
                style={{
                  width: "auto",
                  border: "1px solid #e1e7e3",
                }}
                onClick={resetForm}
              >
                {isPersian ? "لغو" : "Cancel"}
              </button>
            )}

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving
                ? isPersian
                  ? "در حال ذخیره..."
                  : "Saving..."
                : editingId
                  ? isPersian
                    ? "ذخیره تغییرات"
                    : "Save Changes"
                  : isPersian
                    ? "افزودن محصول"
                    : "Add Product"}
            </button>
          </div>
        </form>
      </div>

      {/* PRODUCTS TABLE */}

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h3>{isPersian ? "لیست محصولات" : "Product List"}</h3>

            <span
              style={{
                color: "#718096",
                fontSize: "11px",
              }}
            >
              {isPersian ? "تمام محصولات ثبت‌شده" : "All registered products"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="content-card-body">
            {isPersian ? "در حال بارگذاری..." : "Loading..."}
          </div>
        ) : products.length === 0 ? (
          <div className="content-card-body">
            {isPersian ? "هنوز محصولی ثبت نشده است." : "No products found."}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  <th>{isPersian ? "محصول" : "Product"}</th>

                  <th>{isPersian ? "دسته‌بندی" : "Category"}</th>

                  <th>{isPersian ? "واحد" : "Unit"}</th>

                  <th>{isPersian ? "خرید" : "Buy"}</th>

                  <th>{isPersian ? "فروش" : "Sell"}</th>

                  <th>{isPersian ? "موجودی" : "Stock"}</th>

                  <th>{isPersian ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>{product.category}</td>

                    <td>{product.unit}</td>

                    <td>{Number(product.buyPrice).toLocaleString()} AFN</td>

                    <td>{Number(product.sellPrice).toLocaleString()} AFN</td>

                    <td>
                      <span
                        className={
                          Number(product.stock) > 0
                            ? "badge badge-success"
                            : "badge badge-danger"
                        }
                      >
                        {Number(product.stock).toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                        }}
                      >
                        <button
                          type="button"
                          className="sidebar-action"
                          style={{
                            width: "auto",
                            padding: "7px 10px",
                            color: "#087f5b",
                            background: "#e8f7f1",
                          }}
                          onClick={() => handleEdit(product)}
                        >
                          {isPersian ? "ویرایش" : "Edit"}
                        </button>

                        <button
                          type="button"
                          className="sidebar-action"
                          style={{
                            width: "auto",
                            padding: "7px 10px",
                            color: "#dc4c4c",
                            background: "#fff0f0",
                          }}
                          onClick={() => handleDelete(product.id)}
                        >
                          {isPersian ? "حذف" : "Delete"}
                        </button>
                      </div>
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

export default Products;
