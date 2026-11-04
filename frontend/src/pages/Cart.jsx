
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import QuantityStepper from "../components/QuantityStepper";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  setCoupon,
  setCouponError,
  removeCoupon,
  selectCartCount,
  selectSubtotal,
  selectDiscount,
  selectShipping,
  selectTotal,
  selectProductSubtotal,
} from "../redux/cartSlice";
import api from "../services/api";

function Cart() {
  const dispatch = useDispatch();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const { items, couponCode, couponError } = useSelector(
    (state) => state.cart
  );

  const cartCount = useSelector(selectCartCount);
  const subtotal = useSelector(selectSubtotal);
  const productSubtotal = useSelector(selectProductSubtotal);
  const discount = useSelector(selectDiscount);
  const shipping = useSelector(selectShipping);
  const total = useSelector(selectTotal);

  const handleCoupon = async () => {
    if (!couponInput.trim()) {
      dispatch(setCouponError("Enter a coupon code."));
      return;
    }

    setCouponLoading(true);
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponInput.trim(),
        subtotal: Number(productSubtotal.toFixed(2)),
      });
      dispatch(setCoupon({
        code: data.coupon.code,
        discountAmount: data.discountAmount,
      }));
    } catch (error) {
      dispatch(
        setCouponError(
          error.response?.data?.message || "Unable to validate this coupon."
        )
      );
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="cart-page">
        <div className="cart-heading">
          <div>
            <h1>Your Cart</h1>
            <p>{cartCount} {cartCount === 1 ? "item" : "items"} in your cart</p>
          </div>

          {items.length > 0 && (
            <button
              className="clear-cart-button"
              onClick={() => dispatch(clearCart())}
            >
              <Trash2 size={17} />
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={55} />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/" className="continue-shopping-button">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {items.map((item) => {
                const discountedPrice =
                  item.price -
                  (item.price * item.discountPercentage) / 100;

                return (
                  <article className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className="cart-item-details">
                      <Link to={`/product/${item.id}`}>
                        <h3>{item.name}</h3>
                      </Link>

                      <p>{item.brand}</p>

                      <strong>
                        ₹{discountedPrice.toFixed(2)}
                      </strong>

                      <QuantityStepper
                        quantity={item.quantity}
                        max={item.stock}
                        onIncrease={() =>
                          dispatch(increaseQuantity(item.id))
                        }
                        onDecrease={() =>
                          dispatch(decreaseQuantity(item.id))
                        }
                      />
                    </div>

                    <button
                      className="remove-item-button"
                      onClick={() =>
                        dispatch(removeFromCart(item.id))
                      }
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={19} />
                    </button>
                  </article>
                );
              })}

              <Link to="/" className="continue-shopping-link">
                ← Continue Shopping
              </Link>
            </section>

            <aside className="order-summary">
              <h2>Order Summary</h2>

              <div className="coupon-section">
                <label htmlFor="coupon">Coupon Code</label>

                <div className="coupon-input">
                  <input
                    id="coupon"
                    type="text"
                    placeholder="Try KADAI10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />

                  <button onClick={handleCoupon} disabled={couponLoading}>
                    {couponLoading ? "Checking..." : "Apply"}
                  </button>
                </div>

                {couponError && (
                  <p className="coupon-error">{couponError}</p>
                )}

                {couponCode && (
                  <p className="coupon-success">
                    {couponCode} applied successfully!
                    <button onClick={() => dispatch(removeCoupon())}>
                      Remove
                    </button>
                  </p>
                )}
              </div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="summary-total">
                <strong>Total</strong>
                <strong>₹{total.toFixed(2)}</strong>
              </div>

              <Link to="/checkout" className="checkout-button">
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Cart;
