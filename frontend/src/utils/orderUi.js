export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const statusLabel = (status, isPersian) => {
  const labels = {
    pending: ["Pending", "در انتظار"],
    confirmed: ["Confirmed", "تأیید شده"],
    preparing: ["Preparing", "در حال آماده‌سازی"],
    out_for_delivery: ["Out for Delivery", "در مسیر تحویل"],
    delivered: ["Delivered", "تحویل شده"],
    cancelled: ["Cancelled", "لغو شده"],
  };
  return labels[status]?.[isPersian ? 1 : 0] || status;
};

export const statusColor = (status) => ({
  pending: "#b7791f",
  confirmed: "#2b6cb0",
  preparing: "#6b46c1",
  out_for_delivery: "#2c7a7b",
  delivered: "#087f5b",
  cancelled: "#c53030",
}[status] || "#718096");

export const orderMoney = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " AFN";
