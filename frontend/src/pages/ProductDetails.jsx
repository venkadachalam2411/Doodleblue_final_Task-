
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import ProductGallery from "../components/ProductGallery";
import ProductCard from "../components/ProductCard";
import QuantityStepper from "../components/QuantityStepper";

import { fetchProducts } from "../redux/productsSlice";
import { addToCart } from "../redux/cartSlice";

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, loading } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (items.length === 0) dispatch(fetchProducts());
  }, [dispatch, items.length]);

  const product = items.find((item) => String(item.id) === id);

  if (loading && !product) {
    return (
      <>
        <Header />
        <main className="product-loading" role="status">
          Loading product...
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="product-not-found">
          <h2>Product not found</h2>
          <Link to="/">Back to Products</Link>
        </main>
        <Footer />
      </>
    );
  }

  const discountedPrice =
    product.price - (product.price * (product.discountPercentage || 0)) / 100;

  const outOfStock = product.stock <= 0;

  const productImages =
    product.images?.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const relatedProducts = items
    .filter(
      (item) =>
        item.category === product.category && item.id !== product.id
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    if (outOfStock) return;

    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    handleAddToCart();
    navigate("/cart");
  };

  return (
    <>
      <Header />

      <main className="product-details-page">
        <Breadcrumb
          items={[
            { label: product.category },
            { label: product.name },
          ]}
        />

        <section className="product-details-layout">
          <ProductGallery
            key={product.id}
            images={productImages}
            productName={product.name}
          />

          <div className="product-details-info">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="product-brand">Brand: {product.brand}</p>

            <div className="product-rating">
              <Star size={17} fill="currentColor" />
              {product.rating} ({product.reviewCount || 0} reviews)
            </div>

            <div className="details-price">
              <strong>₹{discountedPrice.toFixed(2)}</strong>
              {product.discountPercentage > 0 && (
                <>
                  <del>₹{product.price.toFixed(2)}</del>
                  <span>{product.discountPercentage}% OFF</span>
                </>
              )}
            </div>

            <p className="details-stock">
              {outOfStock
                ? "Out of stock"
                : product.stock < 10
                ? `Only ${product.stock} left`
                : "In stock"}
            </p>

            <div className="details-quantity">
              <span>Quantity</span>
              <QuantityStepper
                quantity={quantity}
                onIncrease={() =>
                  setQuantity((q) => Math.min(q + 1, product.stock))
                }
                onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                max={product.stock}
              />
            </div>

            <div className="details-actions">
              <button
                className="add-cart-button"
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                className="buy-now-button"
                onClick={handleBuyNow}
                disabled={outOfStock}
              >
                Buy Now
              </button>
            </div>
          </div>
        </section>

        <section className="product-information">
          <div className="details-tabs">
            <button
              className={activeTab === "description" ? "active" : ""}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>

            <button
              className={activeTab === "specifications" ? "active" : ""}
              onClick={() => setActiveTab("specifications")}
            >
              Specifications
            </button>

            <button
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "description" && (
              <p>{product.description || "No description available."}</p>
            )}

            {activeTab === "specifications" && (
              <ul>
                {Object.entries(product.specifications || {}).map(
                  ([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  )
                )}
                {Object.keys(product.specifications || {}).length === 0 && (
                  <li>Specifications not available.</li>
                )}
              </ul>
            )}

            {activeTab === "reviews" && (
              <p>
                {product.rating || 0} out of 5 based on{" "}
                {product.reviewCount || 0} reviews.
              </p>
            )}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>You May Also Like</h2>
            <div className="product-grid">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default ProductDetails;
