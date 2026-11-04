import { Minus, Plus } from "lucide-react";

function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  max = 99,
}) {
  return (
    <div className="quantity-stepper">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>

      <span>{quantity}</span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export default QuantityStepper;