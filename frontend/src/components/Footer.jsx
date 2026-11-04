
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Footer() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="RYTHM home">
            <img src="/rythm-logo-header.png" alt="RYTHM — Play, Shop, Inspire" />
          </Link>

          <p>
            Discover your sound. Find the perfect instrument
            and bring your music to life.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/">Products</Link>
          <Link to="/cart">Shopping Cart</Link>
        </div>

        <div className="footer-links">
          <h3>My Account</h3>
          {isAuthenticated ? (
            <>
              {user?.role === "admin" ? (
                <Link to="/admin">Admin Dashboard</Link>
              ) : (
                <Link to="/orders">My Orders</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>

        <div className="footer-links">
          <h3>Customer Support</h3>
          <a href="mailto:support@rythm.com">Contact Us</a>
          <span>Shipping Information</span>
          <span>Return Policy</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 RYTHM. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
