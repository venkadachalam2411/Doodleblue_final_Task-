
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Upload, X, ArrowLeft } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { addProduct } from "../redux/productsSlice";

function AddProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    discountPercentage: "",
    stock: "",
    description: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState("");
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

    const fileInput = document.getElementById("product-image");

    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const price = Number(formData.price);
    const discount = Number(formData.discountPercentage || 0);
    const stock = Number(formData.stock);

    if (price <= 0 || stock < 0 || discount < 0 || discount > 100) {
      setError("Please enter valid price, stock and discount values.");
      return;
    }

    if (!formData.name.trim() || !formData.brand.trim() ||
        !formData.category) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      await dispatch(addProduct({
        ...formData,
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        price,
        discountPercentage: discount,
        stock,
        rating: 0,
        reviewCount: 0,
        image: formData.image || "/instrument-placeholder.svg",
        images: formData.image ? [formData.image] : [],
        isActive: true,
      })).unwrap();
      navigate("/admin");
    } catch (requestError) {
      setError(requestError || "Unable to save this product.");
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
            <h1>Add New Product</h1>
            <p>Enter the details of your new instrument.</p>
          </div>

          <Link to="/admin">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >
          <div className="form-grid">
            <div>
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
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
                placeholder="Enter brand"
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
                placeholder="Enter price"
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
                placeholder="Enter discount"
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
                placeholder="Enter stock"
                required
              />
            </div>
          </div>

          <div className="admin-image-upload">
            <label htmlFor="product-image">Product Image</label>

            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            <label
              htmlFor="product-image"
              className="admin-upload-label"
            >
              <Upload size={20} />
              <span>Choose Product Image</span>
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
              placeholder="Describe the product"
              rows="5"
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth-submit-button" disabled={saving}>
            {saving ? "Saving..." : "Add Product"}
          </button>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default AddProduct;
