const CART_KEY = "dairy-customer-cart";

function getCartKey() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id ? CART_KEY + "-" + user.id : CART_KEY;
  } catch {
    return CART_KEY;
  }
}

export function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(getCartKey()) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(getCartKey());
}
