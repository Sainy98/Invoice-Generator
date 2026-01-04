"use client";

import { useState } from "react";

type Item = {
  name: string;
  qty: number;
  price: number;
  discount: number;
};

export default function AddItemForm({
  onAdd,
}: {
  onAdd: (item: Item) => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [enableItemDiscount, setEnableItemDiscount] = useState(false);

  const subtotal = Number(qty || 0) * Number(price || 0);

  const total = Math.max(
    subtotal - (enableItemDiscount ? Number(discount || 0) : 0),
    0
  );

  const handleAdd = () => {
    if (!name || !qty || !price) {
      alert("Fill required fields");
      return;
    }

    onAdd({
      name,
      qty: Number(qty),
      price: Number(price),
      discount: enableItemDiscount ? Number(discount || 0) : 0,
    });

    // reset
    setName("");
    setQty("");
    setPrice("");
    setDiscount("");
    setEnableItemDiscount(false);
  };

  return (
    <div className="item-form">
      <h3>Add Item</h3>

     

      <div className="item-grid">
        <input
          className="full"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="row">
          <select className="qty" value={qty} onChange={(e) => setQty(e.target.value)}>
            <option value="">Qty</option>
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          {enableItemDiscount && (
            <input
              type="number"
              placeholder="Discount ₹"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          )}

          <input
            className="total-price"
            value={total.toFixed(2)}
            readOnly
          />
        </div>
         {/* Toggle FIRST (better UX) */}
      <label className="discount-label" style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={enableItemDiscount}
          onChange={() => setEnableItemDiscount(!enableItemDiscount)}
        />
        Apply item discount
      </label>
      </div>

      <button onClick={handleAdd}>Add Item</button>
    </div>
  );
}
