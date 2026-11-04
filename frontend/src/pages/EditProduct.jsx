
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Upload, X, ArrowLeft } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchProducts, updateProduct } from "../redux/productsSlice";

function EditProduct() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items, loading, error: productsError } = useSelector(
    (state) => state.products
  );
  const product = items.find((item) => String(item.id) === id);

  useEffect(() => {
    if (items.length === 0) dispatch(fetchProducts());
  }, [dispatch, items.length]);

  if (!product) {
    return (
      <>
        <Header />
        <main className="admin-form-page">
          <h2>{loading ? "Loading product..." : "Product not found"}</h2>
          {productsError && <p className="form-error" role="alert">{productsError}</p>}
          <Link to="/admin">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return <ProductEditor key={product.id} product={product} />;
}

function ProductEditor({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: product.name || "",
    brand: product.brand || "",
    category: product.category || "",
    price: product.price ?? "",
    discountPercentage: product.discountPercentage ?? 0,
    stock: product.stock ?? "",
    description: product.description || "",
    image: product.image || product.images?.[0] || "",
  });

  const [imagePreview, setImagePreview] = useState(formData.image);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const image = reader.result;

      setFormData((prev) => ({
        ...prev,
        image,
      }));

      setImagePreview(image);
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));

    setImagePreview("");

    const fileInput = document.getElementById("edit-product-image");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const price = Number(formData.price);
    const discount = Number(formData.discountPercentage || 0);
    const stock = Number(formData.stock);

    if (
      !formData.name.trim() ||
      !formData.brand.trim() ||
      !formData.category
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      discount < 0 ||
      discount > 100
    ) {
      setError("Please enter valid price, stock and discount values.");
      return;
    }

    setSaving(true);
    try {
      await dispatch(updateProduct({
        ...product,
        ...formData,
        id: product.id,
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        price,
        discountPercentage: discount,
        stock,
        image: formData.image || "/instrument-placeholder.svg",
        images: formData.image ? [formData.image] : [],
      })).unwrap();
      navigate("/admin");
    } catch (requestError) {
      setError(requestError || "Unable to update this product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <main className="admin-form-page">
        <div className="admin-form-heading">
          <div>
            <span className="admin-label">PRODUCT MANAGEMENT</span>
            <h1>Edit Product</h1>
            <p>Update the product information.</p>
          </div>

          <Link to="/admin">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="brand">Brand *</label>
              <input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Guitars">Guitars</option>
                <option value="Keyboards">Keyboards</option>
                <option value="Drums">Drums</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label htmlFor="price">Price (₹) *</label>
              <input
                id="price"
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="discountPercentage">Discount (%)</label>
              <input
                id="discountPercentage"
                type="number"
                name="discountPercentage"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                id="stock"
                type="number"
                name="stock"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="admin-image-upload">
            <label htmlFor="edit-product-image">Product Image</label>

            <input
              id="edit-product-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            <label
              htmlFor="edit-product-image"
              className="admin-upload-label"
            >
              <Upload size={20} />
              <span>Choose or Replace Product Image</span>
              <small>PNG, JPG or WEBP · Maximum 5 MB</small>
            </label>

            {imagePreview && (
              <div className="admin-image-preview">
                <img src={imagePreview} alt="Product preview" />

                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove product image"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth-submit-button" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default EditProduct;
