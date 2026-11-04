import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, CheckCircle2, ShieldCheck } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  selectDiscount,
  selectShipping,
  selectSubtotal,
  selectTotal,
} from "../redux/cartSlice";
import api from "../services/api";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, couponCode } = useSelector((state) => state.cart);
  const subtotal = useSelector(selectSubtotal);
  const discount = useSelector(selectDiscount);
  const shipping = useSelector(selectShipping);
  const total = useSelector(selectTotal);
  const address = location.state?.address;
  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  if (!address) {
    return <Navigate to="/checkout" replace />;
  }

  const handlePlaceOrder = async () => {
    setError("");
    setPlacingOrder(true);

    try {
      const { data } = await api.post("/orders", {
        items: items.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone,
          address: address.street.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          postalCode: address.pincode,
          country: "India",
        },
        paymentMethod: "COD",
        couponCode: couponCode || undefined,
      });

      navigate(`/orders/${data.order._id}`, {
        replace: true,
        state: { orderPlaced: true },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <Header />
      <main className="checkout-page payment-page">
        <div className="checkout-heading">
          <div>
            <span className="checkout-eyebrow">SECURE CHECKOUT</span>
            <h1>Payment</h1>
            <p>Review your payment method and place your order.</p>
          </div>
          <div className="checkout-progress" aria-label="Checkout progress">
            <span className="checkout-progress-step is-complete">
              <span><CheckCircle2 size={16} /></span> Delivery
            </span>
            <span className="checkout-progress-line is-complete" />
            <span className="checkout-progress-step is-current">
              <span>2</span> Payment
            </span>
          </div>
        </div>

        <div className="checkout-layout">
          <section className="checkout-form payment-panel">
            <div className="checkout-section-title">
              <span className="checkout-section-icon"><Banknote size={20} /></span>
              <div>
                <h2>Cash on Delivery</h2>
                <p>Pay in cash when your order is delivered.</p>
              </div>
            </div>

            <div className="cod-method">
              <span className="cod-radio" aria-hidden="true" />
              <Banknote size={22} />
              <div>
                <strong>Cash on Delivery (COD)</strong>
                <p>No online payment required. Please keep the exact amount ready.</p>
              </div>
            </div>

            <div className="delivery-review">
              <h3>Delivering to</h3>
              <p><strong>{address.fullName}</strong> · {address.phone}</p>
              <p>
                {address.street}, {address.city}, {address.state} {address.pincode}
              </p>
              <Link to="/checkout" state={{ address }}>
                Edit delivery address
              </Link>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="checkout-form-footer">
              <Link to="/checkout" state={{ address }} className="checkout-back-link">
                <ArrowLeft size={17} /> Back
              </Link>
              <button
                type="button"
                className="checkout-button"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? "Placing order..." : `Place order · ₹${total.toFixed(2)}`}
              </button>
            </div>
          </section>

          <aside className="order-summary checkout-summary">
            <h2>Order summary</h2>
            <div className="checkout-summary-items">
              {items.map((item) => (
                <div className="checkout-summary-item" key={item.id}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <span>Qty {item.quantity}</span>
                  </div>
                  <b>
                    ₹{(
                      item.price *
                      (1 - (item.discountPercentage || 0) / 100) *
                      item.quantity
                    ).toFixed(2)}
                  </b>
                </div>
              ))}
            </div>
            <div className="summary-row">
              <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
              <span>−₹{discount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-total">
              <strong>Total due on delivery</strong>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
            <p className="checkout-secure">
              <ShieldCheck size={17} /> Your payment is collected at delivery
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Payment;
