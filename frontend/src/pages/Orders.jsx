import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Package,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const statusClassName = (status) =>
  `order-status order-status-${String(status || "placed")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/orders/my-orders");
        if (active) setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your orders. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <>
      <Header />

      <main className="orders-page">
        <section className="orders-hero">
          <div className="orders-hero-icon"><PackageCheck size={25} /></div>
          <div>
            <span className="admin-label">YOUR ACCOUNT</span>
            <h1>My Orders</h1>
            <p>All your RYTHM purchases, together in one place.</p>
          </div>
          <Link to="/" className="orders-shop-link">
            <ShoppingBag size={17} /> Continue shopping
          </Link>
        </section>

        {!loading && !error && orders.length > 0 && (
          <div className="orders-overview">
            <div className="orders-overview-icon"><Package size={19} /></div>
            <p>
              You have <strong>{orders.length}</strong>{" "}
              {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>
        )}

        {loading && (
          <div className="orders-loading" role="status">
            <span className="orders-loading-mark"><Package size={22} /></span>
            <p>Loading your orders...</p>
          </div>
        )}

        {error && (
          <div className="orders-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <span className="orders-empty-icon"><Package size={31} /></span>
            <h2>Your next favourite is waiting</h2>
            <p>You haven’t placed an order yet. Find an instrument that inspires you.</p>
            <Link to="/" className="orders-primary-link">
              Explore instruments <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const itemCount = order.items?.reduce(
                (count, item) => count + item.quantity,
                0
              ) || 0;

              return (
                <article className="order-card" key={order._id}>
                  <div className="order-card-top">
                    <div className="order-card-reference">
                      <span className="order-card-icon"><Package size={19} /></span>
                      <div>
                        <span className="order-card-label">ORDER</span>
                        <h2>#{order._id}</h2>
                      </div>
                    </div>
                    <span className={statusClassName(order.orderStatus)}>
                      {order.orderStatus || "Placed"}
                    </span>
                  </div>

                  <div className="order-card-meta">
                    <span><CalendarDays size={16} /> {formatDate(order.createdAt)}</span>
                    <span><ShoppingBag size={16} /> {itemCount} {itemCount === 1 ? "item" : "items"}</span>
                    <span className="order-card-total-label">Order total</span>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                  </div>

                  <div className="order-card-bottom">
                    <span>Payment: {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</span>
                    <Link to={`/orders/${order._id}`}>
                      View order details <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Orders;
