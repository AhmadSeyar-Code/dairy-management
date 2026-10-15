import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/useLanguage";

function Expenses() {
  const { language } = useLanguage();
  const isPersian = language === "fa";

  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadExpensesOnMount = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/expenses");

        if (!isMounted) return;

        setExpenses(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error(requestError);

        if (!isMounted) return;

        setError(
          isPersian ? "دریافت مصارف ناموفق بود." : "Failed to load expenses.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadExpensesOnMount();

    return () => {
      isMounted = false;
    };
  }, [isPersian]);

  const loadExpenses = async () => {
    try {
      setError("");

      const response = await api.get("/expenses");

      setExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "دریافت مصارف ناموفق بود." : "Failed to load expenses."),
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
      title: "",
      amount: "",
      description: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = {
        title: form.title,
        amount: Number(form.amount),
        description: form.description,
      };

      if (editingId) {
        await api.put(`/expenses/${editingId}`, data);
      } else {
        await api.post("/expenses", data);
      }

      resetForm();

      await loadExpenses();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "ذخیره مصرف ناموفق بود." : "Failed to save expense."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setForm({
      title: expense.title || "",
      amount: expense.amount || "",
      description: expense.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      isPersian
        ? "آیا از حذف این مصرف مطمئن هستید؟"
        : "Are you sure you want to delete this expense?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/expenses/${id}`);

      await loadExpenses();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.response?.data?.message ||
          (isPersian ? "حذف مصرف ناموفق بود." : "Failed to delete expense."),
      );
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );

  return (
    <div>
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>{isPersian ? "مصارف" : "Expenses"}</h1>

          <p>
            {isPersian
              ? "مدیریت مصارف و هزینه‌های لبنیات"
              : "Manage dairy business expenses"}
          </p>
        </div>
      </div>

      {/* STAT */}

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-title">
              {isPersian ? "مجموع مصارف" : "Total Expenses"}
            </span>

            <span className="stat-icon">◉</span>
          </div>

          <div className="stat-value">{totalExpenses.toFixed(2)}</div>

          <div className="stat-subtitle">AFN</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-title">
              {isPersian ? "تعداد مصارف" : "Expense Records"}
            </span>

            <span className="stat-icon">#</span>
          </div>

          <div className="stat-value">{expenses.length}</div>

          <div className="stat-subtitle">
            {isPersian ? "ثبت شده" : "Recorded"}
          </div>
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
                  ? "ویرایش مصرف"
                  : "Edit Expense"
                : isPersian
                  ? "افزودن مصرف"
                  : "Add Expense"}
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718096",
                fontSize: "12px",
              }}
            >
              {isPersian
                ? "معلومات مصرف را وارد کنید."
                : "Enter expense information."}
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
              <label>{isPersian ? "عنوان مصرف" : "Expense Title"}</label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={
                  isPersian
                    ? "مثلاً برق، کرایه، معاش..."
                    : "e.g. Electricity, Rent..."
                }
                required
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "مبلغ" : "Amount"}</label>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label>{isPersian ? "توضیحات" : "Description"}</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={
                  isPersian ? "توضیحات اختیاری..." : "Optional description..."
                }
                rows="3"
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
                    ? "افزودن مصرف"
                    : "Add Expense"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}

      <div className="content-card" style={{ marginTop: "20px" }}>
        <div className="content-card-header">
          <div>
            <h3>{isPersian ? "لیست مصارف" : "Expense List"}</h3>

            <span
              style={{
                color: "#718096",
                fontSize: "11px",
              }}
            >
              {isPersian ? "تمام مصارف ثبت‌شده" : "All recorded expenses"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="content-card-body">
            {isPersian ? "در حال بارگذاری..." : "Loading..."}
          </div>
        ) : expenses.length === 0 ? (
          <div className="content-card-body">
            {isPersian ? "هنوز مصرفی ثبت نشده است." : "No expenses found."}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  <th>{isPersian ? "عنوان" : "Title"}</th>

                  <th>{isPersian ? "مبلغ" : "Amount"}</th>

                  <th>{isPersian ? "توضیحات" : "Description"}</th>

                  <th>{isPersian ? "تاریخ" : "Date"}</th>

                  <th>{isPersian ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={expense.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{expense.title}</strong>
                    </td>

                    <td>
                      <strong>
                        {Number(expense.amount || 0).toFixed(2)} AFN
                      </strong>
                    </td>

                    <td>{expense.description || "-"}</td>

                    <td>
                      {expense.expenseDate
                        ? new Date(expense.expenseDate).toLocaleDateString()
                        : "-"}
                    </td>

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
                          onClick={() => handleEdit(expense)}
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
                          onClick={() => handleDelete(expense.id)}
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

export default Expenses;
