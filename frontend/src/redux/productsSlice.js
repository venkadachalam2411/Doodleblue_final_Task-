import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "The product request failed.";

const normalizeProduct = (product) => ({
  ...product,
  id: product._id || product.id,
  name: product.title || product.name,
  category: product.category
    ? product.category.replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "",
  image:
    product.thumbnail ||
    product.images?.[0] ||
    product.image ||
    "/instrument-placeholder.svg",
  images: product.images?.length
    ? product.images
    : product.thumbnail || product.image
      ? [product.thumbnail || product.image]
      : [],
  rating: Number(product.rating || 0),
  reviewCount: Number(product.ratingCount ?? product.reviewCount ?? 0),
});

const serializeProduct = (product) => ({
  title: product.name.trim(),
  description: product.description?.trim() || "No description available.",
  category: product.category.toLowerCase(),
  brand: product.brand.trim(),
  price: Number(product.price),
  discountPercentage: Number(product.discountPercentage || 0),
  stock: Number(product.stock),
  thumbnail: product.image || "/instrument-placeholder.svg",
  images: product.image ? [product.image] : [],
  instrumentType: product.category,
});

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/products", { params: { limit: 50 } });
      if (!Array.isArray(data.products)) {
        throw new Error("The products API returned an unexpected response.");
      }
      return data.products.map(normalizeProduct);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (product, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/products", serializeProduct(product));
      return normalizeProduct(data.product);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (product, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/products/${product.id}`,
        serializeProduct(product)
      );
      return normalizeProduct(data.product);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => String(item.id) === String(action.payload.id)
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => String(item.id) !== String(action.payload)
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setSelectedProduct } = productsSlice.actions;

export default productsSlice.reducer;
