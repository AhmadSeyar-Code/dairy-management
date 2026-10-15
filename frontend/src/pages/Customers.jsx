import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function Customers() {
  const { language } = useLanguage();
  const isPersian = language === "fa";

  const [customers, setCustomers] = useState([]);
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

    const loadCustomersOnMount = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/customers");

        if (!isMounted) return;

        setCustomers(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error(requestError);

        if (!isMounted) return;

        setError(
          isPersian
            ? "دریافت مشتریان ناموفق بود."
            : "Failed to load customers.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCustomersOnMount();

    return () => {
      isMounted = false;
    };
  }, [isPersian]);

  const loadCustomers = async () => {
    try {
      setError("");

      const response = await api.get("/customers");

      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian
            ? "دریافت مشتریان ناموفق بود."
            : "Failed to load customers."),
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
        await api.put(`/customers/${editingId}`, form);
      } else {
        await api.post("/customers", form);
      }

      resetForm();
      await loadCustomers();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "ذخیره مشتری ناموفق بود." : "Failed to save customer."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      isPersian
        ? "آیا از حذف این مشتری مطمئن هستید؟"
        : "Are you sure you want to delete this customer?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/customers/${id}`);

      await loadCustomers();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "حذف مشتری ناموفق بود." : "Failed to delete customer."),
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isPersian ? "مشتریان" : "Customers"}</h1>

          <p>{isPersian ? "مدیریت مشتریان سیستم" : "Manage your customers"}</p>
        </div>

        <span className="badge badge-success">
          {customers.length} {isPersian ? "مشتری" : "Customers"}
        </span>
      </div>

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
                  ? "ویرایش مشتری"
                  : "Edit Customer"
                : isPersian
                  ? "افزودن مشتری"
                  : "Add Customer"}
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718096",
                fontSize: "12px",
              }}
            >
              {isPersian
                ? "معلومات مشتری را وارد کنید"
                : "Enter customer information"}
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
              <label>{isPersian ? "نام مشتری" : "Customer Name"}</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={isPersian ? "نام مشتری" : "Customer name"}
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
                placeholder={isPersian ? "آدرس مشتری" : "Customer address"}
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
                    ? "افزودن مشتری"
                    : "Add Customer"}
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h3>{isPersian ? "لیست مشتریان" : "Customer List"}</h3>

            <span
              style={{
                color: "#718096",
                fontSize: "11px",
              }}
            >
              {isPersian ? "تمام مشتریان ثبت‌شده" : "All registered customers"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="content-card-body">
            {isPersian ? "در حال بارگذاری..." : "Loading..."}
          </div>
        ) : customers.length === 0 ? (
          <div className="content-card-body">
            {isPersian ? "هنوز مشتری ثبت نشده است." : "No customers found."}
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
                {customers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{customer.name}</strong>
                    </td>

                    <td>{customer.phone || "-"}</td>

                    <td>{customer.address || "-"}</td>

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
                          onClick={() => handleEdit(customer)}
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
                          onClick={() => handleDelete(customer.id)}
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

export default Customers;
