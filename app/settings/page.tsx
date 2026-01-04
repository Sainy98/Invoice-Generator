"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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
    alert("Business details saved!");
  };

  return (
    <main>
      <div className="card">
        <h1>Business Settings</h1>
        <hr />
        <label>Business Name</label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
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
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Your business address"
        />

        <button onClick={saveDetails}>Save Details</button>
      </div>
    </main>
  );
}
