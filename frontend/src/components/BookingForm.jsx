import React, { useState } from "react";
import { User, Phone, Users, Calendar, Clock, ChevronRight } from "lucide-react";

export default function BookingForm({ onSubmit, initialData = {}, title = "Complete Your Booking", loading = false }) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    partySize: initialData.partySize || 2,
    date: initialData.date || "",
    time: initialData.time || "",
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="booking-form-container" style={{
      background: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "20px",
      padding: "24px",
      backdropFilter: "blur(12px)"
    }}>
      <h3 style={{ marginBottom: "20px", fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{title}</h3>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="input-group">
          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#9aa4b2", fontWeight: 500 }}>Guest Name</label>
          <div style={{ position: "relative" }}>
            <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#ff7a00" }} />
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                color: "#fff",
                outline: "none",
                transition: "border-color 0.3s"
              }}
            />
          </div>
        </div>

        <div className="input-group">
          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#9aa4b2", fontWeight: 500 }}>Phone Number</label>
          <div style={{ position: "relative" }}>
            <Phone size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#ff7a00" }} />
            <input
              type="tel"
              name="phone"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                color: "#fff",
                outline: "none"
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="input-group">
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#9aa4b2", fontWeight: 500 }}>Party Size</label>
            <div style={{ position: "relative" }}>
              <Users size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#ff7a00" }} />
              <input
                type="number"
                name="partySize"
                min="1"
                value={formData.partySize}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#9aa4b2", fontWeight: 500 }}>Date</label>
            <div style={{ position: "relative" }}>
              <Calendar size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#ff7a00" }} />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  outline: "none",
                  colorScheme: "dark"
                }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "12px",
            background: "linear-gradient(135deg, #ff7a00, #ff9f43)",
            border: "none",
            borderRadius: "12px",
            padding: "14px",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 15px rgba(255, 122, 0, 0.3)"
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => !loading && (e.currentTarget.style.transform = "translateY(0)")}
        >
          {loading ? "Processing..." : "Confirm Reservation"}
          {!loading && <ChevronRight size={18} />}
        </button>
      </form>
    </div>
  );
}
