
import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { addToCart } from "../redux/cartSlice";

function ProductCard({ product }) {
  const dispatch = useDispatch();

  const cartItem = useSelector((state) =>
    state.cart.items.find((item) => item.id === product.id)
  );

  const discountedPrice =
    product.price -
    (product.price * product.discountPercentage) / 100;

  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!outOfStock) {
      dispatch(addToCart(product));
    }
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image">
        <img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/instrument-placeholder.svg"; }} />

        {product.discountPercentage > 0 && (
          <span className="discount-badge">
            -{product.discountPercentage}%
          </span>
        )}
      </Link>

      <div className="product-info">
        <span className="product-category">{product.category}</span>

        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-rating">
          <Star size={15} fill="currentColor" />
          <span>{product.rating}</span>
          <span>({product.reviewCount} reviews)</span>
        </div>

        <div className="product-prices">
          <strong>₹{discountedPrice.toFixed(2)}</strong>
          {product.discountPercentage > 0 && (
            <del>₹{product.price.toFixed(2)}</del>
          )}
        </div>

        <p className="product-stock">
          {outOfStock
            ? "Out of stock"
            : product.stock < 10
            ? `Only ${product.stock} left`
            : "In stock"}
        </p>

        <button
          className="add-cart-button"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          <ShoppingCart size={17} />
          {outOfStock
            ? "Out of Stock"
            : cartItem
            ? `In Cart (${cartItem.quantity})`
            : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
