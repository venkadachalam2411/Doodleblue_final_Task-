
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Search, ShoppingCart, UserRound } from "lucide-react";

import { selectCartCount } from "../redux/cartSlice";
import { logout } from "../redux/authSlice";

function Header() {
  const [search, setSearch] = useState("");
  const cartCount = useSelector(selectCartCount);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    const query = search.trim();

    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="header-container">

        <Link to="/" className="brand-logo" aria-label="RYTHM home">
          <img src="/rythm-logo-header.png" alt="RYTHM — Play, Shop, Inspire" />
        </Link>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search musical instruments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />

          <button type="submit" aria-label="Search">
            <Search size={20} />
          </button>
        </form>

        <nav className="header-nav">
          <Link to="/" className="nav-link">
            Products
          </Link>

          <Link to="/cart" className="cart-link">
            <ShoppingCart size={21} />
            <span>Cart</span>

            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === "admin" ? (
                <Link to="/admin" className="account-link">
                  <UserRound size={18} />
                  <span>Admin</span>
                </Link>
              ) : (
                <>
                  <span className="account-greeting">
                    <UserRound size={18} />
                    <span>Hi, {user?.name || "there"}</span>
                  </span>
                  <Link to="/orders" className="nav-link orders-nav-link">
                    Orders
                  </Link>
                </>
              )}
              <button type="button" className="logout-link" onClick={handleLogout}>
                <LogOut size={17} />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="login-link">
              <UserRound size={18} />
              <span>Login</span>
            </Link>
          )}
        </nav>

      </div>
    </header>
  );
}

export default Header;
