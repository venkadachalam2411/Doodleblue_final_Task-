import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  ReceiptText,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { clearCart } from "../redux/cartSlice";
import api from "../services/api";

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusClassName = (status) =>
  `order-status order-status-${String(status || "placed")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.orderPlaced) {
      dispatch(clearCart());
    }
  }, [dispatch, location.state?.orderPlaced]);

  useEffect(() => {
    let active = true;
    const loadOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(`/orders/${id}`);
        if (active) setOrder(data.order);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load order details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrder();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <>
      <Header />

      <main className="order-details-page">
        {location.state?.orderPlaced && (
          <section className="order-success-banner" role="status" aria-live="polite">
            <span className="order-success-icon"><CheckCircle2 size={26} /></span>
            <div>
              <strong>Order placed successfully!</strong>
              <p>Your order is confirmed. We’ll keep you updated as it moves along.</p>
            </div>
          </section>
        )}

        <Link to="/orders" className="order-details-back">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>

        {loading && (
          <section className="order-details-state" role="status">
            <span className="orders-loading-mark"><Package size={22} /></span>
            <p>Loading your order details...</p>
          </section>
        )}

        {!loading && error && (
          <section className="order-details-state order-details-error" role="alert">
            <span className="orders-empty-icon"><Package size={25} /></span>
            <h1>Order details unavailable</h1>
            <p>{error}</p>
            <Link to="/orders">Return to My Orders</Link>
          </section>
        )}

        {!loading && !error && order && (
          <>
            <header className="order-details-heading">
              <div>
                <span className="checkout-eyebrow">ORDER SUMMARY</span>
                <h1>Thanks for your order</h1>
                <p>Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</p>
              </div>
              <span className={statusClassName(order.orderStatus)}>
                {order.orderStatus || "Placed"}
              </span>
            </header>

            <div className="order-details-reference">
              <span>ORDER NUMBER</span>
              <strong>{order._id}</strong>
            </div>

            <div className="order-details-layout">
              <section className="order-details-card order-items-card">
                <div className="order-details-card-heading">
                  <span className="order-details-card-icon"><Package size={19} /></span>
                  <div>
                    <h2>Items in your order</h2>
                    <p>{order.items.length} {order.items.length === 1 ? "product" : "products"}</p>
                  </div>
                </div>

                <div className="order-details-items">
                  {order.items.map((item) => (
                    <article className="order-details-item" key={item.product}>
                      <img
                        src={item.thumbnail || "/instrument-placeholder.svg"}
                        alt={item.title}
                      />
                      <div className="order-details-item-info">
                        <strong>{item.title}</strong>
                        <span>Quantity: {item.quantity}</span>
                      </div>
                      <strong className="order-details-item-price">
                        {formatCurrency(item.price * item.quantity)}
                      </strong>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="order-details-side">
                <section className="order-details-card order-total-card">
                  <div className="order-details-card-heading">
                    <span className="order-details-card-icon"><ReceiptText size={19} /></span>
                    <div><h2>Payment summary</h2></div>
                  </div>
                  <div className="order-price-lines">
                    <div><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                    {order.discountAmount > 0 && (
                      <div>
                        <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                        <span>−{formatCurrency(order.discountAmount)}</span>
                      </div>
                    )}
                    <div><span>Shipping</span><span>{order.shippingCharge === 0 ? "Free" : formatCurrency(order.shippingCharge)}</span></div>
                  </div>
                  <div className="order-total-line">
                    <strong>Total due on delivery</strong>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                  </div>
                  <p className="order-payment-note">
                    Cash on Delivery · {order.paymentStatus || "Pending"}
                  </p>
                </section>

                {order.shippingAddress && (
                  <section className="order-details-card order-address-card">
                    <div className="order-details-card-heading">
                      <span className="order-details-card-icon"><MapPin size={19} /></span>
                      <div><h2>Delivery address</h2></div>
                    </div>
                    <address>
                      <strong>{order.shippingAddress.fullName}</strong>
                      <span>{order.shippingAddress.address}</span>
                      <span>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </span>
                      <span>{order.shippingAddress.country}</span>
                      <span>{order.shippingAddress.phone}</span>
                    </address>
                  </section>
                )}
              </aside>
            </div>

            <div className="order-details-footer">
              <p>Need anything else? Your order is always available in your account.</p>
              <Link to="/orders">View all orders <ArrowLeft size={15} /></Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default OrderDetails;
