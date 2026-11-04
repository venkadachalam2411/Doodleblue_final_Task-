
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  couponCode: "",
  couponDiscountAmount: 0,
  couponError: "",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;

      if (product.stock <= 0) return;

      const existingItem = state.items.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          existingItem.quantity += 1;
        }
      } else {
        state.items.push({
          ...product,
          quantity: 1,
        });
      }
    },

    increaseQuantity: (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload
      );

      if (item && item.quantity < item.stock) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    clearCart: (state) => {
      state.items = [];
      state.couponCode = "";
      state.couponDiscountAmount = 0;
      state.couponError = "";
    },

    setCoupon: (state, action) => {
      state.couponCode = action.payload.code;
      state.couponDiscountAmount = action.payload.discountAmount;
      state.couponError = "";
    },

    setCouponError: (state, action) => {
      state.couponError = action.payload;
    },

    removeCoupon: (state) => {
      state.couponCode = "";
      state.couponDiscountAmount = 0;
      state.couponError = "";
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  setCoupon,
  setCouponError,
  removeCoupon,
} = cartSlice.actions;

// Cart selectors
export const selectCartCount = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

export const selectSubtotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

export const selectProductSubtotal = (state) =>
  Number(
    state.cart.items
      .reduce(
        (total, item) =>
          total +
          Number(
            (
              item.price *
              (1 - (item.discountPercentage || 0) / 100)
            ).toFixed(2)
          ) *
            item.quantity,
        0
      )
      .toFixed(2)
  );

export const selectDiscount = (state) => {
  const productDiscount = selectSubtotal(state) - selectProductSubtotal(state);
  return productDiscount + (state.cart.couponDiscountAmount || 0);
};

export const selectShipping = (state) => {
  const subtotal = selectProductSubtotal(state);
  return subtotal >= 5000 || subtotal === 0 ? 0 : 499;
};

export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state);
  return (
    subtotal -
    selectDiscount(state) +
    selectShipping(state)
  );
};

export default cartSlice.reducer;
