import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import MilkPurchases from "./pages/MilkPurchases";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Employees from "./pages/Employees";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerProducts from "./pages/CustomerProducts";
import CustomerCart from "./pages/CustomerCart";
import CustomerCheckout from "./pages/CustomerCheckout";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerOrderDetails from "./pages/CustomerOrderDetails";
import AdminOrders from "./pages/AdminOrders";

import AdminRoute from "./components/AdminRoute";
import CustomerRoute from "./components/CustomerRoute";
import StaffRoute from "./components/StaffRoute";
import Layout from "./components/Layout";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
        {/* Public Pages */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<AdminRoute><Register /></AdminRoute>} />
        <Route path="/customer-register" element={<CustomerRegister />} />

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <StaffRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </StaffRoute>
          }
        />

        {/* Products */}

        <Route
          path="/products"
          element={
            <AdminRoute>
              <Layout>
                <Products />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Suppliers */}

        <Route
          path="/suppliers"
          element={
            <AdminRoute>
              <Layout>
                <Suppliers />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Customers */}

        <Route
          path="/customers"
          element={
            <AdminRoute>
              <Layout>
                <Customers />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Milk Purchases */}

        <Route
          path="/milk-purchases"
          element={
            <AdminRoute>
              <Layout>
                <MilkPurchases />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Sales */}

        <Route
          path="/sales"
          element={
            <StaffRoute>
              <Layout>
                <Sales />
              </Layout>
            </StaffRoute>
          }
        />

        {/* Expenses */}

        <Route
          path="/expenses"
          element={
            <AdminRoute>
              <Layout>
                <Expenses />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <AdminRoute>
              <Layout>
                <Employees />
              </Layout>
            </AdminRoute>
          }
        />

        <Route path="/customer-dashboard" element={<CustomerRoute><Layout><CustomerDashboard /></Layout></CustomerRoute>} />
        <Route path="/shop/products" element={<CustomerRoute><Layout><CustomerProducts /></Layout></CustomerRoute>} />
        <Route path="/cart" element={<CustomerRoute><Layout><CustomerCart /></Layout></CustomerRoute>} />
        <Route path="/checkout" element={<CustomerRoute><Layout><CustomerCheckout /></Layout></CustomerRoute>} />
        <Route path="/customer/orders" element={<CustomerRoute><Layout><CustomerOrders /></Layout></CustomerRoute>} />
        <Route path="/customer/orders/:id" element={<CustomerRoute><Layout><CustomerOrderDetails /></Layout></CustomerRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><Layout><AdminOrders /></Layout></AdminRoute>} />

        {/* Default */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
