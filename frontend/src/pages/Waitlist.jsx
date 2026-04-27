import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Waitlist.css";

function Waitlist() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const userEmail = localStorage.getItem("email");

        // Get my bookings
        const myRes = await fetch("http://localhost:5000/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myData = await myRes.json();
        const activeBooking = myData.find(b => ["waiting", "confirmed"].includes(b.status));

        if (activeBooking) {
          const wlRes = await fetch(`http://localhost:5000/api/bookings/waitlist/${activeBooking.restaurantId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const wlData = await wlRes.json();
          
          setWaitlist(wlData.map(item => ({
            ...item,
            isMe: item.userEmail === userEmail
          })) || []);
        } else {
          setWaitlist([]);
        }
      } catch (err) {
        console.error("Waitlist error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlist();
  }, [navigate]);

  return (
    <div className="waitlist-container">
      <header className="waitlist-header">
        <h1>Live <span className="highlight">Waitlist</span></h1>
        <p>Stay updated on your table status</p>
      </header>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching queue status...</p>
        </div>
      ) : waitlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h3>Queue is clear</h3>
          <p>No active reservations or walk-ins in the queue for your current restaurant.</p>
          <button className="book-now-btn" onClick={() => navigate("/restaurants")}>Book a Table</button>
        </div>
      ) : (
        <div className="waitlist-content">
          <div className="stats-bar">
            <div className="stat-item">
              <strong>{waitlist.length}</strong>
              <span>Parties</span>
            </div>
            <div className="stat-item highlight">
              <strong>~{waitlist.length * 12}m</strong>
              <span>Est. Wait</span>
            </div>
          </div>

          <div className="waitlist-grid">
            {waitlist.map((item, i) => (
              <div key={item._id} className={`wait-item ${item.isMe ? "me" : ""}`}>
                <div className="rank">#{i + 1}</div>
                <div className="details">
                  <div className="top">
                    <span className="user">{item.isMe ? "YOU" : item.userEmail.split("@")[0]}</span>
                    {item.isMe && <span className="me-badge">Your Spot</span>}
                  </div>
                  <div className="bottom">
                    <span>👤 {item.partySize} Guests</span>
                    <span className="dot">•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
                <div className={`status-tag ${item.status}`}>{item.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Waitlist;