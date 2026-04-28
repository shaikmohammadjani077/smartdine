import React, { useEffect, useState } from "react";

export default function StaffPanel() {
  const [hotelName, setHotelName] = useState("");
  const [tables, setTables] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffError, setStaffError] = useState("");
  
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("current"); // current, upcoming, cancelled
  
  const [dailySummary, setDailySummary] = useState({
    todayReservations: 0,
    walkIns: 0,
    cancelledBookings: 0,
    tableUtilization: 0,
  });

  const [newTable, setNewTable] = useState({ capacity: 2, count: 1 });

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/staff/dashboard?date=${targetDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.error) {
        setStaffError(data.error);
      } else {
        setStaffError("");
        setHotelName(data.hotelName || "Assigned Restaurant");
        setTables(data.tables || []);
        setWaitlist(data.waitlist || []);
        setDailySummary({
          todayReservations: data.todayReservations || 0,
          walkIns: data.walkIns || 0,
          cancelledBookings: data.cancelledBookings || 0,
          tableUtilization: data.tableUtilization || 0,
        });
      }
    } catch (err) {
      console.error(err);
      setStaffError("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [targetDate, refreshTrigger]);

  const handleAssignTable = async (table) => {
    if (!selectedCustomer || table.status !== "available") return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/staff/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableId: table.name,
          customerId: selectedCustomer._id,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to assign table");

      setSelectedCustomer(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Server error occurred");
    }
  };

  const stats = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    waiting: waitlist.length,
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dash-container">
        <div className="dash-top-bar">
          <div>
            <p className="sub">Front Desk Operations</p>
            <h2>{hotelName}</h2>
            <span className="tag">STAFF PORTAL</span>
          </div>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <input
              type="date"
              className="admin-select"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{ padding: "12px 18px", background: "rgba(255, 255, 255, 0.03)" }}
            />
          </div>
        </div>

        {staffError && (
          <div className="empty" style={{ borderColor: "var(--red)", color: "var(--red)" }}>
            ⚠️ <strong>Issue:</strong> {staffError}. Please contact admin.
          </div>
        )}

        {!staffError && !loading && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Reservations</span>
                <strong>{dailySummary.todayReservations}</strong>
              </div>
              <div className="stat-card">
                <span>Walk-Ins</span>
                <strong>{dailySummary.walkIns}</strong>
              </div>
              <div className="stat-card">
                <span>Cancelled</span>
                <strong>{dailySummary.cancelledBookings}</strong>
              </div>
              <div className="stat-card">
                <span>Utilization</span>
                <strong>{dailySummary.tableUtilization}%</strong>
              </div>
            </div>

            <div className="dash-grid">
              <section className="map-card">
                <div className="section-head">
                  <div>
                    <p className="sub">Live Map</p>
                    <h3>Table Status Overview</h3>
                  </div>
                  <div className="pill">
                    {selectedCustomer ? `Assigning: ${selectedCustomer.name}` : "Select customer from Queue"}
                  </div>
                </div>

                <div className="status-legend" style={{ display: "flex", gap: "15px", marginBottom: "20px", fontSize: "13px", color: "var(--soft)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--green)" }}></span> Available</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--red)" }}></span> Occupied</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--yellow)" }}></span> Reserved</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }}></span> Waiting</span>
                </div>

                <div className="table-flex">
                  {tables.map((t) => (
                    <button
                      key={t._id}
                      className={`t-card ${t.status}`}
                      disabled={!selectedCustomer || t.status !== "available"}
                      onClick={() => handleAssignTable(t)}
                    >
                      <div className="t-head">TABLE {t.name}</div>
                      <p>Capacity: {t.capacity}</p>
                      <div className="status-wrapper">
                        <span className={`status ${t.status}`}>{t.status}</span>
                      </div>
                      {t.status === "occupied" && t.currentGuest && (
                        <div className="customer-detail">
                          <span><span className="c-label">Guest</span> {t.currentGuest}</span>
                          <span><span className="c-label">Size</span> {t.partySize || 2} Guests</span>
                          <span><span className="c-label">Time</span> {t.bookingTime || "N/A"}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              <aside className="wait-card">
                <div className="section-head" style={{ marginBottom: "0" }}>
                  <h3>Booking Overview</h3>
                </div>

                <div className="tabs" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                  <button className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>Current Queue</button>
                </div>

                {waitlist.length === 0 ? (
                  <div className="empty">
                    <div style={{ fontSize: "30px" }}>⏳</div>
                    <div>No customers waiting.</div>
                  </div>
                ) : (
                  waitlist.map((p, index) => (
                    <div
                      key={p._id}
                      className={`wait-row ${selectedCustomer?._id === p._id ? "selected" : ""}`}
                    >
                      <div>
                        <div className="cust-name">{p.name}</div>
                        <div className="cust-time">Pos: #{index + 1} • {p.guests || 0} Guests • {p.time || "Walk-In"}</div>
                        <div className="cust-time" style={{ fontSize: "11px", marginTop: "4px" }}>
                          Status: <span style={{ color: p.status === "confirmed" ? "var(--green)" : "var(--yellow)", textTransform: "uppercase" }}>{p.status}</span>
                        </div>
                      </div>
                      <button className="assign-btn" onClick={() => setSelectedCustomer(p)}>
                        {selectedCustomer?._id === p._id ? "Selected" : "Assign"}
                      </button>
                    </div>
                  ))
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
