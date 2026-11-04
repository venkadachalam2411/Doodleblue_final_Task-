import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, ShieldCheck } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  selectDiscount,
  selectShipping,
  selectSubtotal,
  selectTotal,
} from "../redux/cartSlice";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, couponCode } = useSelector((state) => state.cart);
  const subtotal = useSelector(selectSubtotal);
  const discount = useSelector(selectDiscount);
  const shipping = useSelector(selectShipping);
  const total = useSelector(selectTotal);
  const [error, setError] = useState("");
  const [address, setAddress] = useState(() => location.state?.address || {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (event) => {
    setAddress((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!/^[0-9]{10}$/.test(address.phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(address.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    navigate("/payment", { state: { address } });
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="checkout-page checkout-empty">
          <h1>Your cart is empty</h1>
          <p>Add products before continuing to checkout.</p>
          <Link to="/" className="checkout-button">Continue Shopping</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="checkout-page">
        <div className="checkout-heading">
          <div>
            <span className="checkout-eyebrow">SECURE CHECKOUT</span>
            <h1>Delivery details</h1>
            <p>Where should we deliver your order?</p>
          </div>
          <div className="checkout-progress" aria-label="Checkout progress">
            <span className="checkout-progress-step is-current">
              <span>1</span> Delivery
            </span>
            <span className="checkout-progress-line" />
            <span className="checkout-progress-step">
              <span>2</span> Payment
            </span>
          </div>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-section-title">
              <span className="checkout-section-icon"><MapPin size={19} /></span>
              <div>
                <h2>Shipping address</h2>
                <p>Enter the recipient and delivery address.</p>
              </div>
            </div>

            <div className="checkout-fields">
              <div className="checkout-field checkout-field-full">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  value={address.fullName}
                  onChange={handleChange}
                  placeholder="Name on the delivery"
                  required
                />
              </div>
              <div className="checkout-field checkout-field-full">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
              <div className="checkout-field checkout-field-full">
                <label htmlFor="street">Street address</label>
                <textarea
                  id="street"
                  name="street"
                  autoComplete="street-address"
                  value={address.street}
                  onChange={handleChange}
                  placeholder="House number, street and area"
                  rows="3"
                  required
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  autoComplete="address-level1"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
              </div>
              <div className="checkout-field checkout-field-full">
                <label htmlFor="pincode">PIN code</label>
                <input
                  id="pincode"
                  name="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={address.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="checkout-form-footer">
              <Link to="/cart" className="checkout-back-link">
                <ArrowLeft size={17} /> Back to cart
              </Link>
              <button type="submit" className="checkout-button">
                Continue to payment <ArrowRight size={17} />
              </button>
            </div>
          </form>

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
              <strong>Total</strong><strong>₹{total.toFixed(2)}</strong>
            </div>
            <p className="checkout-secure">
              <ShieldCheck size={17} /> Your order is securely processed
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Checkout;
