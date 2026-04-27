import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem("name") || "User");
  const [image, setImage] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, redirecting to login...");
      navigate("/");
      return;
    }

    const fetchProfileData = async () => {
      try {
        console.log("Fetching profile data from backend...");
        const res = await fetch("http://localhost:5000/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Profile fetch response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("Profile data received:", data);
          setReservations(data || []);
        } else {
          const errData = await res.json();
          console.error("Profile fetch error response:", errData);
        }
      } catch (err) {
        console.error("Profile fetch exception:", err);
      } finally {
        console.log("Profile fetch complete, setting loading to false");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    localStorage.setItem("name", e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <div className="profile-top">
        <img
          src={image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt="profile"
          className="profile-pic"
        />

        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-btn">Change Photo</label>
          <input id="file-upload" type="file" onChange={handleImageChange} style={{display: 'none'}} />
        </div>

        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          className="name-input"
          placeholder="Enter your name"
        />
      </div>

      <div className="profile-content-grid">
        <div className="profile-section">
          <h3>Previous Reservations</h3>
          {loading ? (
            <p>Loading...</p>
          ) : reservations.length === 0 ? (
            <p>No reservations yet.</p>
          ) : (
            <div className="data-list">
              {reservations.map((r) => (
                <div key={r._id} className="data-card">
                  <div className="card-header">
                    <strong>{r.restaurantName}</strong>
                    <span className={`status-badge ${r.status}`}>{r.status}</span>
                  </div>
                  <div className="card-body">
                    <p>{r.date} at {r.time}</p>
                    <p>Table: {r.tableId || "Waitlist"} • {r.partySize} Guests</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h3>Payment History</h3>
          <div className="data-list">
            <div className="data-card mock">
              <div className="card-header">
                <strong>Pre-payment for "ab"</strong>
                <span className="status-badge confirmed">Success</span>
              </div>
              <div className="card-body">
                <p>26-04-2026 • ₹300</p>
                <small>Paid via UPI</small>
              </div>
            </div>
            <p className="no-more">No more payment history.</p>
          </div>
        </div>

        <div className="profile-section">
          <h3>Orders</h3>
          <div className="data-list">
            <div className="data-card mock">
              <div className="card-header">
                <strong>Live Order: "ab"</strong>
                <span className="status-badge confirmed">Preparing</span>
              </div>
              <div className="card-body">
                <p>1x Paneer Tikka, 2x Butter Naan</p>
                <p>Total: ₹550</p>
              </div>
            </div>
            <p className="no-more">No previous orders found.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;