
import { useState } from "react";

function ProductGallery({ images = [], productName = "Product" }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (images.length === 0) {
    return (
      <div className="product-gallery-empty">
        No product images available
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div className="main-product-image">
        <img
          src={images[selectedImage]}
          alt={productName}
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/instrument-placeholder.svg"; }}
        />
      </div>

      {images.length > 1 && (
        <div className="product-thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              className={selectedImage === index ? "active" : ""}
              onClick={() => setSelectedImage(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={image} alt={`${productName} ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
