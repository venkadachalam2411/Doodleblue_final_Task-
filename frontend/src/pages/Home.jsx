
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../redux/productsSlice";

const categories = ["All", "Guitars", "Keyboards", "Drums"];

function Home() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(
    (state) => state.products
  );

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("featured");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [page, setPage] = useState(1);

  const productsPerPage = 5;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    let result = [...items];

    if (searchQuery) {
      result = result.filter((product) =>
        `${product.name} ${product.brand} ${product.category}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    if (category !== "All") {
      result = result.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (filtersApplied) {
      if (minPrice !== "") {
        result = result.filter((product) => product.price >= Number(minPrice));
      }

      if (maxPrice !== "") {
        result = result.filter((product) => product.price <= Number(maxPrice));
      }

      if (minRating > 0) {
        result = result.filter((product) => product.rating >= minRating);
      }
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    items,
    searchQuery,
    category,
    minPrice,
    maxPrice,
    minRating,
    filtersApplied,
    sort,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const displayedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  const clearFilters = () => {
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setFiltersApplied(false);
    setSort("featured");
    setPage(1);
  };

  const applyFilters = () => {
    setFiltersApplied(true);
    setPage(1);
  };

  return (
    <>
      <Header />

      <main className="home-page">
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-tag">EXCLUSIVE OFFER</span>
            <h1>Find your rhythm. Make it yours.</h1>
            <p>Discover instruments that bring your music to life.</p>
            <a href="#products" className="hero-button">
              Shop Deals
            </a>
          </div>
          <aside className="hero-offer" aria-label="This week's offer">
            <span className="hero-offer-label">Use code</span>
            <strong className="hero-offer-code">KADAI10</strong>
            <span className="hero-offer-discount">10% OFF</span>
            <p>Free shipping on orders above ₹5,000.</p>
          </aside>
        </section>

        <section className="products-section" id="products">
          <div className="products-section-heading">
            <span>THE RYTHM COLLECTION</span>
            <h2>Find the instrument that moves you</h2>
          </div>
          <div className="products-layout">
          <aside className="filter-sidebar">
            <div className="filter-heading">
              <h2>Filters</h2>
              <button onClick={clearFilters}>Clear all</button>
            </div>

            <div className="filter-group">
              <h3>Categories</h3>
              {categories.map((item) => (
                <label key={item} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={category === item}
                    onChange={() => {
                      setCategory(item);
                      setPage(1);
                    }}
                  />
                  {item}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h3>Price Range (₹)</h3>
              <input
                type="number"
                placeholder="Minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                placeholder="Maximum price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <h3>Minimum Rating</h3>
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="filter-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                  />
                  {rating}+ Stars
                </label>
              ))}
            </div>

            <button className="apply-filter-button" onClick={applyFilters}>
              Apply Filters
            </button>
          </aside>

          <div className="product-listing">
            <div className="listing-heading">
              <div>
                <h2>All Products</h2>
                <p>{filteredProducts.length} products found</p>
                {searchQuery && <p>Search results for "{searchQuery}"</p>}
              </div>

              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {loading && (
              <p className="loading-message">Loading products...</p>
            )}

            {error && (
              <div className="error-message">
                <p>Unable to load products. Please try again.</p>
                <button onClick={() => dispatch(fetchProducts())}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && displayedProducts.length === 0 && (
              <p className="empty-message">No products found.</p>
            )}

            {!loading && !error && (
              <div className="product-grid">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-arrow"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  aria-label="Previous page"
                >
                  &lsaquo;
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      className={pageNumber === page ? "active" : ""}
                      aria-current={pageNumber === page ? "page" : undefined}
                      aria-label={`Page ${pageNumber}`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="pagination-arrow"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  aria-label="Next page"
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
