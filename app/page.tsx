"use client";

import { useEffect, useState } from "react";
import { FiTrash2, FiPlus, FiDownload, FiShare2 } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { useToast } from "./components/ToastProvider";


type InvoiceItem = {
  name: string;
  qty: number;
  price: number;
  discount: number;
  enableDiscount: boolean;
};

export default function InvoicePage() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", qty: 1, price: 0, discount: 0, enableDiscount: false },
  ]);

    const {showToast} = useToast();

  const [enableInvoiceDiscount, setEnableInvoiceDiscount] = useState(false);
  const [invoiceDiscount, setInvoiceDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"amount" | "percent">(
    "amount"
  );
  const [showBusinessWarning, setShowBusinessWarning] = useState(false);


  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoiceHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("invoiceHistory", JSON.stringify(items));
  }, [items]);

  const sanitizePositive = (val: string | number, allowZero = true) => {
    const num = Number(val);
    if (Number.isNaN(num)) return allowZero ? 0 : 1;
    if (!allowZero) return Math.max(1, Math.floor(num));
    return Math.max(0, Math.floor(num));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    if (field === "qty") {
      newItems[index].qty = sanitizePositive(value, false);
    } else if (field === "price" || field === "discount") {
      newItems[index][field] = sanitizePositive(value, true);
    } else {
      (newItems[index] as any)[field] = value;
    }
    setItems(newItems);
  };

  const addRow = () => {
    setItems([
      ...items,
      { name: "", qty: 1, price: 0, discount: 0, enableDiscount: false },
    ]);
  };

  const deleteRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => {
    const discount = item.enableDiscount ? item.discount : 0;
    const lineTotal = Math.max(item.price - discount, 0) * item.qty;
    return sum + lineTotal;
  }, 0);

  const invoiceDiscountValue =
    enableInvoiceDiscount && invoiceDiscount
      ? discountType === "percent"
        ? (subtotal * Number(invoiceDiscount || 0)) / 100
        : Number(invoiceDiscount || 0)
      : 0;

  const grandTotal = Math.max(subtotal - invoiceDiscountValue, 0);
  const showItemDiscountColumn = items.some(
    (item) => item.enableDiscount && item.discount > 0
  );

  const isBusinessDetailsSaved = () => {
    const raw = localStorage.getItem("businessDetails");

    if (!raw) {
      setShowBusinessWarning(true);
      return false;
    }

    try {
      const data = JSON.parse(raw);

      if (
        !data.businessName?.trim() ||
        !data.phone?.trim() ||
        !data.address?.trim()
      ) {
        setShowBusinessWarning(true);
        return false;
      }

      setShowBusinessWarning(false);
      return true;
    } catch {
      setShowBusinessWarning(true);
      return false;
    }
  };

  const handleResetInvoice = () => {
    if (confirm("Are you sure you want to reset the invoice?")) {
      setItems([
        { name: "", qty: 1, price: 0, discount: 0, enableDiscount: false },
      ]);
      setEnableInvoiceDiscount(false);
      setInvoiceDiscount("");
      setDiscountType("amount");
      showToast("Invoice reset successfully!", "success");
    }
  };

 

  const generateSimplePDF = (mode: "download" | "share") => {
    if (!isBusinessDetailsSaved()) {
      if (mode === "share") {
        setShowBusinessWarning(true);
      }
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const business =
      JSON.parse(localStorage.getItem("businessDetails") || "{}");
    const pageWidth = doc.internal.pageSize.getWidth();

    const businessName = business.businessName || "Your Business Name";
    const phone = business.phone || "";
    const address = business.address || "";



    /* ===== BUSINESS HEADER ===== */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(businessName, 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    if (address) {
      doc.text(address, 14, 24, { maxWidth: 90 });
    }

    if (phone) {
      doc.text(`Phone: ${phone}`, 14, 30);
    }

    /* ===== INVOICE TITLE (RIGHT SIDE) ===== */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    // doc.text("INVOICE", 195, 18, { align: "right" });
    doc.text("INVOICE", pageWidth - 14, 18, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Dynamic date + time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN'); // DD/MM/YYYY format (India)
    const timeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }); // 2:28 PM format

    
    // doc.text(`Time: ${timeStr}`, 195, 32, { align: "right" });
    doc.text(`Time: ${timeStr}`, pageWidth - 14, 26, { align: "right" });
    doc.text(`Date: ${dateStr}`, pageWidth - 14, 32, { align: "right" }); 


    /* ===== TABLE ===== */
    autoTable(doc, {
      startY: 35,
      margin: { left: 14, right: 14 }, // page margins
      tableWidth: "auto", // 🔥 automatically takes full width between margins

      head: showItemDiscountColumn
        ? [["#", "Item", "Qty", "Price", "Discount", "Total"]]
        : [["#", "Item", "Qty", "Price", "Total"]],

      body: items.map((item, index) => {
        const discount = item.enableDiscount ? item.discount : 0;
        const total = Math.max(item.price - discount, 0) * item.qty;

        return showItemDiscountColumn
          ? [
            index + 1,
            item.name || "-",
            item.qty,
            item.price.toFixed(2),
            discount.toFixed(2),
            total.toFixed(2),
          ]
          : [
            index + 1,
            item.name || "-",
            item.qty,
            item.price.toFixed(2),
            total.toFixed(2),
          ];
      }),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 4,
        textColor: [40, 40, 40],
        valign: "middle",
      },

      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },

      columnStyles: {}, // remove fixed widths to auto-distribute columns

      alternateRowStyles: {
        fillColor: [245, 247, 255],
      },
    });



    /* ===== TOTALS BLOCK ===== */
    let y = (doc as any).lastAutoTable.finalY + 12;

    // right column positions
    const labelX = 120;
    // const valueX = 185;
    const valueX = pageWidth - 14;

    // Subtotal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Subtotal", labelX, y);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, valueX, y, { align: "right" });

    // Invoice Discount
    if (enableInvoiceDiscount) {
      y += 7;
      doc.text(
        `Invoice Discount (${discountType === "percent" ? invoiceDiscount + "%" : "Rs."})`,
        labelX,
        y
      );
      doc.text(
        `- Rs. ${invoiceDiscountValue.toFixed(2)}`,
        valueX,
        y,
        { align: "right" }
      );
    }

    // Divider line
    y += 6;
    doc.setDrawColor(200);
    doc.line(labelX, y, valueX, y);

    // Grand Total
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Grand Total", labelX, y);
    doc.text(
      `Rs. ${grandTotal.toFixed(2)}`,
      valueX,
      y,
      { align: "right" }
    );
    if (mode === "download") {
      showToast("PDF successfully generated!", "success");
      doc.save(`Invoice-${dateStr}, ${timeStr}.pdf`);
    } else {
      const pdfBlob = doc.output("blob");
      const file = new File([pdfBlob], `Invoice-${dateStr}, ${timeStr}.pdf`, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        navigator.share({ files: [file], title: `Invoice-${dateStr}, ${timeStr}.pdf` });
      } else {
        doc.save(`Invoice-${dateStr}, ${timeStr}.pdf`); // fallback
      }
    }
  }



  return (
    <main className="invoice-root">

      <div className="invoice-card">
        <header className="invoice-header">
          <div className="invoice-title">
            <h1>Invoice Generator</h1>
            <p>Create professional invoices instantly.</p>
          </div>
          <span className="invoice-badge">v1.0</span>
        </header>

        {/* Items Table */}
        <div className="table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Price (₹)</th>
                <th>Discount</th>
                <th>Total (₹)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const discount = item.enableDiscount ? item.discount : 0;
                const total =
                  Math.max(item.price - discount, 0) * item.qty;

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        className="input text-input"
                        value={item.name}
                        onChange={(e) => {
                          const captalized = e.target.value.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                          updateItem(index, "name", captalized)
                        }
                        }
                        placeholder="Item name"
                      />
                    </td>
                    <td>
                      <input
                        className="input number-input"
                        type="number"
                        min={1}
                        value={item.qty}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "qty",
                            e.target.value === "" ? 1 : e.target.value
                          )
                        }
                        onBlur={(e) =>
                          updateItem(
                            index,
                            "qty",
                            e.target.value === "" ? 1 : e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input number-input"
                        type="number"
                        placeholder="e.g. 500"
                        min={0}
                        value={item.price === 0 ? "" : item.price}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "price",
                            e.target.value === "" ? 0 : e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <div className="discount-cell">
                        <input
                          type="checkbox"
                          checked={item.enableDiscount}
                          onChange={() =>
                            updateItem(
                              index,
                              "enableDiscount",
                              !item.enableDiscount
                            )
                          }
                        />
                        {item.enableDiscount && (
                          <input
                            className="input number-input"
                            type="number"
                            placeholder="₹10"
                            value={item.discount === 0 ? "" : item.discount}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "discount",
                                e.target.value === "" ? 0 : e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    </td>
                    <td className="amount-cell">₹{total.toFixed(2)}</td>
                    <td>
                      <button
                        className="icon-button danger"
                        onClick={() => deleteRow(index)}
                        aria-label="Delete row"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Row */}
        <button className="primary-ghost-button" onClick={addRow}>
          <FiPlus />
          <span>Add Item</span>
        </button>

        {/* Invoice Discount */}
        <section className="discount-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={enableInvoiceDiscount}
              onChange={() =>
                setEnableInvoiceDiscount(!enableInvoiceDiscount)
              }
            />
            Apply invoice-level discount
          </label>

          {enableInvoiceDiscount && (
            <div className="discount-controls">
              <select
                className="input select-input"
                value={discountType}
                onChange={(e) =>
                  setDiscountType(
                    e.target.value as "amount" | "percent"
                  )
                }
              >
                <option value="amount">₹ Amount</option>
                <option value="percent">% Percentage</option>
              </select>
              <input
                className="input number-input"
                type="number"
                min={0}
                placeholder={
                  discountType === "percent"
                    ? "Discount %"
                    : "Discount ₹200"
                }
                value={invoiceDiscount}
                onChange={(e) =>
                  setInvoiceDiscount(
                    e.target.value.replace(/^0+(?=\d)/, "")
                  )
                }
              />

            </div>
          )}
        </section>

        {/* Summary */}
        <section className="summary-section">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {enableInvoiceDiscount && (
            <div className="summary-row">
              <span>
                Invoice Discount{" "}
                {discountType === "percent" && invoiceDiscount
                  ? `(${invoiceDiscount}%)`
                  : ""}
              </span>
              <span>- ₹{invoiceDiscountValue.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row grand">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </section>

        {/* Actions */}
        <footer className="actions-row">
          <button className="secondary-button" onClick={handleResetInvoice} style={{ color: "red" }}>
            <FiTrash2 />
            <span>Reset Invoice</span>
          </button>

          <button className="primary-button" onClick={() => generateSimplePDF("download")}>

            <FiDownload />
            <span>Download PDF</span>
          </button>
          <button className="secondary-button" onClick={() => generateSimplePDF("share")}>
            <FiShare2 />
            <span>Share</span>
          </button>
        </footer>

        {showBusinessWarning && (
          <div className="business-warning">
            <p>
              Please complete your <strong>Business Details</strong> in Settings
              before generating invoice.
            </p>
            <Link href="/settings" className="warning-btn">
              Go to Settings
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
