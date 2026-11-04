
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Package,
  ShoppingBag,
  Plus,
  ArrowUpRight,
  Trash2,
  ClipboardList,
  Boxes,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  deleteProduct,
  fetchProducts,
} from "../redux/productsSlice";
import api from "../services/api";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { items: products, loading, error: productsError } = useSelector(
    (state) => state.products
  );
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch, products.length]);

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        if (active) setOrders(data.orders || []);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load customer orders."
          );
        }
      } finally {
        if (active) setOrdersLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  const handleOrderStatusChange = async (order, orderStatus) => {
    setError("");
    setUpdatingOrderId(order._id);
    try {
      const { data } = await api.patch(`/orders/${order._id}/status`, {
        orderStatus,
      });
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id
            ? { ...currentOrder, ...data.order, user: currentOrder.user }
            : currentOrder
        )
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update this order."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatuses = (status) => {
    const transitions = {
      Placed: ["Confirmed", "Cancelled"],
      Confirmed: ["Processing", "Cancelled"],
      Processing: ["Shipped", "Cancelled"],
      Shipped: ["Delivered"],
    };
    return transitions[status] || [];
  };

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
    },
  ];

  return (
    <>
      <Header />

      <main className="admin-page">
        <div className="admin-heading">
          <div>
            <span className="admin-label">STORE MANAGEMENT</span>
            <h1>Admin dashboard</h1>
            <p>Manage your products and customer orders.</p>
          </div>

          <Link to="/admin/add-product" className="admin-add-button">
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        <section className="admin-stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="admin-stat-card" key={stat.title}>
                <div className="admin-stat-icon">
                  <Icon size={23} />
                </div>

                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
              </div>
            );
          })}
        </section>

        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          <button
            type="button"
            role="tab"
            id="products-tab"
            aria-selected={activeTab === "products"}
            aria-controls="products-panel"
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            <Boxes size={17} /> Products
          </button>
          <button
            type="button"
            role="tab"
            id="orders-tab"
            aria-selected={activeTab === "orders"}
            aria-controls="orders-panel"
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            <ClipboardList size={17} /> Orders
          </button>
        </div>

        {(error || productsError) && (
          <p className="form-error" role="alert">{error || productsError}</p>
        )}

        {activeTab === "products" && (
        <section className="admin-overview" id="products-panel" role="tabpanel" aria-labelledby="products-tab">
          <div className="admin-section-heading">
            <div>
              <h2>Product Management</h2>
              <p>View and manage your store products.</p>
            </div>

            <Link to="/admin/add-product">
              Add New Product <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="admin-row-actions">
                        <Link to={`/admin/edit-product/${product.id}`}>Edit</Link>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Permanently delete ${product.name}?`)) {
                              return;
                            }
                            setError("");
                            try {
                              await dispatch(deleteProduct(product.id)).unwrap();
                            } catch (requestError) {
                              setError(requestError || "Unable to delete this product.");
                            }
                          }}
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && products.length === 0 && !productsError && (
                  <tr>
                    <td colSpan="5">No products available.</td>
                  </tr>
                )}
                {loading && products.length === 0 && (
                  <tr>
                    <td colSpan="5">Loading products...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {activeTab === "orders" && (
          <section className="admin-overview" id="orders-panel" role="tabpanel" aria-labelledby="orders-tab">
            <div className="admin-section-heading">
              <div>
                <h2>Customer orders ({orders.length})</h2>
                <p>Review and update order progress.</p>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table admin-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const nextStatuses = getNextStatuses(order.orderStatus);
                    return (
                      <tr key={order._id}>
                        <td>
                          <Link to={`/orders/${order._id}`} className="admin-order-link">
                            #{order._id.slice(-8)}
                          </Link>
                          <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                        </td>
                        <td>
                          <strong>{order.user?.name || "Customer"}</strong>
                          <small>{order.user?.email || "—"}</small>
                        </td>
                        <td>₹{Number(order.totalAmount || 0).toFixed(2)}</td>
                        <td>{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</td>
                        <td>
                          <span className={`order-status order-status-${String(order.orderStatus).toLowerCase()}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <select
                            aria-label={`Update status for order ${order._id}`}
                            value=""
                            disabled={nextStatuses.length === 0 || updatingOrderId === order._id}
                            onChange={(event) => {
                              if (event.target.value) {
                                handleOrderStatusChange(order, event.target.value);
                              }
                            }}
                          >
                            <option value="">
                              {updatingOrderId === order._id ? "Updating..." : "Update"}
                            </option>
                            {nextStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                  {!ordersLoading && orders.length === 0 && (
                    <tr><td colSpan="6">No customer orders yet.</td></tr>
                  )}
                  {ordersLoading && (
                    <tr><td colSpan="6">Loading orders...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default AdminDashboard;
