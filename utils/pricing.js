// Calculate product price after discount
export const calculateDiscountedPrice = (
    price,
    discountPercentage = 0
) => {
    const discountAmount = (price * discountPercentage) / 100;

    return Number((price - discountAmount).toFixed(2));
};

// Calculate order subtotal
export const calculateSubtotal = (items) => {
    return items.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
};

// Calculate coupon discount
export const calculateCouponDiscount = (
    subtotal,
    couponPercentage = 0
) => {
    return Number(
        ((subtotal * couponPercentage) / 100).toFixed(2)
    );
};

// Calculate shipping charge
export const calculateShipping = (subtotal) => {
    return subtotal >= 5000 ? 0 : 499;
};

// Calculate final order total
export const calculateOrderTotal = (
    subtotal,
    couponDiscount = 0,
    shipping = 0
) => {
    return Number(
        Math.max(0, subtotal - couponDiscount + shipping).toFixed(2)
    );
};