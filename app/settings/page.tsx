"use client";

import { useEffect, useState } from "react";
import { useToast } from "../components/ToastProvider";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const {showToast} = useToast();


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
    showToast("Business details saved successfully!", "success");
  };

  return (
    <main>
    

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
