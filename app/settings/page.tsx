"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
 const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
// Auto-hide toast
useEffect(() => {
  if (toast) {
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }
}, [toast]);

 const capitalize = (text: string) => {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("businessDetails");
    if (saved) {
      const data = JSON.parse(saved);
      setBusinessName(data.businessName || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
    }
  }, []);

  const saveDetails = () => {
    const data = { businessName, phone, address };
    localStorage.setItem("businessDetails", JSON.stringify(data));
    setToast({ message: "Business details saved successfully!", type: "success" });
  };

  return (
    <main>
     <div className="settings-toast-container">
        {toast && (
          <div className={`settings-toast settings-toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        )}
      </div>

      <div className="card">
        <h1>Business Settings</h1>
        <hr />
        <label>Business Name</label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(capitalize(e.target.value))}
          placeholder="My Store"
        />

        <label>Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9876543210"
        />

        <label>Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(capitalize(e.target.value))}
          placeholder="Your business address"
        />

        <button onClick={saveDetails}>Save Details</button>
      </div>
    </main>
  );
}
