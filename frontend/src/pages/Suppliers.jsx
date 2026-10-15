import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function Suppliers() {
  const { language } = useLanguage();
  const isPersian = language === "fa";

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSuppliersOnMount = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/suppliers");

        if (!isMounted) return;

        setSuppliers(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error(requestError);

        if (!isMounted) return;

        setError(
          isPersian
            ? "دریافت تأمین‌کنندگان ناموفق بود."
            : "Failed to load suppliers.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSuppliersOnMount();

    return () => {
      isMounted = false;
    };
  }, [isPersian]);

  const loadSuppliers = async () => {
    try {
      setError("");

      const response = await api.get("/suppliers");

      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian
            ? "دریافت تأمین‌کنندگان ناموفق بود."
            : "Failed to load suppliers."),
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
      name: "",
      phone: "",
      address: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form);
      } else {
        await api.post("/suppliers", form);
      }

      resetForm();
      await loadSuppliers();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian
            ? "ذخیره تأمین‌کننده ناموفق بود."
            : "Failed to save supplier."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);

    setForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      isPersian
        ? "آیا از حذف این تأمین‌کننده مطمئن هستید؟"
        : "Are you sure you want to delete this supplier?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/suppliers/${id}`);

      await loadSuppliers();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian
            ? "حذف تأمین‌کننده ناموفق بود."
            : "Failed to delete supplier."),
      );
    }
  };

  return (
    <div>
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>{isPersian ? "تأمین‌کنندگان" : "Suppliers"}</h1>

          <p>
            {isPersian
              ? "مدیریت تأمین‌کنندگان شیر و محصولات"
              : "Manage milk and product suppliers"}
          </p>
        </div>

        <span className="badge badge-success">
          {suppliers.length} {isPersian ? "تأمین‌کننده" : "Suppliers"}
        </span>
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
                  ? "ویرایش تأمین‌کننده"
                  : "Edit Supplier"
                : isPersian
                  ? "افزودن تأمین‌کننده"
                  : "Add Supplier"}
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718096",
                fontSize: "12px",
              }}
            >
              {isPersian
                ? "اطلاعات تأمین‌کننده را وارد کنید"
                : "Enter supplier information"}
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
              <label>{isPersian ? "نام تأمین‌کننده" : "Supplier Name"}</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={isPersian ? "نام تأمین‌کننده" : "Supplier name"}
                required
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "شماره تماس" : "Phone"}</label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={isPersian ? "شماره تماس" : "Phone number"}
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "آدرس" : "Address"}</label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder={isPersian ? "آدرس" : "Address"}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              flexWrap: "wrap",
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
                    ? "افزودن تأمین‌کننده"
                    : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h3>{isPersian ? "لیست تأمین‌کنندگان" : "Supplier List"}</h3>

            <span
              style={{
                color: "#718096",
                fontSize: "11px",
              }}
            >
              {isPersian
                ? "تمام تأمین‌کنندگان ثبت‌شده"
                : "All registered suppliers"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="content-card-body">
            {isPersian ? "در حال بارگذاری..." : "Loading..."}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="content-card-body">
            {isPersian
              ? "هنوز تأمین‌کننده‌ای ثبت نشده است."
              : "No suppliers found."}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  <th>{isPersian ? "نام" : "Name"}</th>

                  <th>{isPersian ? "شماره تماس" : "Phone"}</th>

                  <th>{isPersian ? "آدرس" : "Address"}</th>

                  <th>{isPersian ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier, index) => (
                  <tr key={supplier.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{supplier.name}</strong>
                    </td>

                    <td>{supplier.phone || "-"}</td>

                    <td>{supplier.address || "-"}</td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
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
                          onClick={() => handleEdit(supplier)}
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
                          onClick={() => handleDelete(supplier.id)}
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

export default Suppliers;
