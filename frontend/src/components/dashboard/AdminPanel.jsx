import React, { useEffect, useState } from "react";
import Chart from "../Chart";

export default function AdminPanel() {
  const [restaurants, setRestaurants] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    location: "",
    contactNumber: "",
    status: "open",
    openingTime: "09:00",
    closingTime: "22:00",
    image: "",
    menu: "",
    tableTypes: [
      { capacity: 2, count: 0 },
      { capacity: 4, count: 0 },
      { capacity: 6, count: 0 },
      { capacity: 8, count: 0 },
    ],
  });

  const [staffAssignForm, setStaffAssignForm] = useState({ staffUserId: "", restaurantId: "" });

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [res1, res2, res3] = await Promise.all([
        fetch("http://localhost:5000/api/admin/restaurants", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/analytics/summary", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/staff", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const restaurantsData = await res1.json();
      const analyticsData = await res2.json();
      const staffData = await res3.json();

      setRestaurants(restaurantsData || []);
      setAnalytics(analyticsData || {});
      setStaffUsers(staffData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddRestaurant = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newRestaurant,
          menu: newRestaurant.menu ? newRestaurant.menu.split(",").map((i) => i.trim()).filter(Boolean) : [],
          tableTypes: newRestaurant.tableTypes.filter((t) => t.count > 0),
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to add restaurant");

      setRestaurants((prev) => [data.restaurant, ...prev]);
      alert("Restaurant added successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/staff/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(staffAssignForm),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to assign staff");

      alert("Staff assigned successfully!");
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/staff/${staffId}/revoke`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let msg = "Failed to revoke staff access";
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch(e) {}
        return alert(msg);
      }
      alert("Access revoked successfully!");
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTableTypeCount = (index, count) => {
    const updated = [...newRestaurant.tableTypes];
    updated[index].count = count;
    setNewRestaurant({ ...newRestaurant, tableTypes: updated });
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dash-container">
        <div className="dash-top-bar">
          <div>
            <p className="sub">System Overview</p>
            <h2>Admin Control Panel</h2>
            <span className="tag">SUPER ADMIN</span>
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading admin data...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Restaurants</span>
                <strong>{analytics.totalRestaurants || 0}</strong>
              </div>
              <div className="stat-card">
                <span>Total Staff</span>
                <strong>{staffUsers.length}</strong>
              </div>
              <div className="stat-card">
                <span>Total Bookings</span>
                <strong>{analytics.totalBookings || 0}</strong>
              </div>
              <div className="stat-card">
                <span>Total Revenue</span>
                <strong>₹{analytics.totalRevenue || 0}</strong>
              </div>
            </div>

            <div className="dash-grid">
              <section className="map-card">
                <div className="section-head">
                  <h3>Create New Restaurant</h3>
                </div>

                <div className="admin-form">
                  <input
                    type="text"
                    placeholder="Restaurant Name"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={newRestaurant.location}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, location: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={newRestaurant.contactNumber}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, contactNumber: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={newRestaurant.image}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, image: e.target.value })}
                  />
                  <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                    <input
                      type="time"
                      placeholder="Opening Time"
                      value={newRestaurant.openingTime}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, openingTime: e.target.value })}
                    />
                    <input
                      type="time"
                      placeholder="Closing Time"
                      value={newRestaurant.closingTime}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, closingTime: e.target.value })}
                    />
                  </div>
                  <select
                    value={newRestaurant.status}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, status: e.target.value })}
                    className="admin-select"
                  >
                    <option value="open">Open (Active)</option>
                    <option value="closed">Closed (Inactive)</option>
                  </select>

                  <div className="table-config-group" style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                    <label style={{ color: "var(--soft)", fontSize: "14px", marginBottom: "10px", display: "block" }}>
                      Define Table Types & Capacity
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {newRestaurant.tableTypes.map((t, index) => (
                        <div key={t.capacity} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ color: "var(--text)", width: "80px" }}>{t.capacity} Seater:</span>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            placeholder="Count"
                            value={t.count || ""}
                            onChange={(e) => updateTableTypeCount(index, Number(e.target.value))}
                            style={{ width: "100%" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="walkin-btn" onClick={handleAddRestaurant}>
                    Create Restaurant
                  </button>
                </div>
              </section>

              <aside className="wait-card">
                <div className="section-head">
                  <h3>Staff Management</h3>
                </div>

                <div className="admin-form" style={{ gridTemplateColumns: "1fr", gap: "10px", marginBottom: "20px" }}>
                  <select
                    value={staffAssignForm.staffUserId}
                    onChange={(e) => setStaffAssignForm({ ...staffAssignForm, staffUserId: e.target.value })}
                    className="admin-select"
                  >
                    <option value="">Select Staff Member</option>
                    {staffUsers.map((s) => (
                      <option key={s._id} value={s._id}>{s.email} ({s.restaurantName || "Unassigned"})</option>
                    ))}
                  </select>
                  <select
                    value={staffAssignForm.restaurantId}
                    onChange={(e) => setStaffAssignForm({ ...staffAssignForm, restaurantId: e.target.value })}
                    className="admin-select"
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map((r) => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                  <button className="assign-btn" onClick={handleAssignStaff}>Assign Role</button>
                </div>

                <div className="data-list" style={{ marginTop: "20px" }}>
                  {staffUsers.length === 0 ? (
                    <p className="empty">No staff users found.</p>
                  ) : (
                    staffUsers.map((s) => (
                      <div key={s._id} className="wait-row" style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div className="cust-name">{s.email.split("@")[0]}</div>
                          <div className="cust-time">{s.restaurantName || "No assigned access"}</div>
                        </div>
                        <button className="assign-btn" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--red)", borderColor: "rgba(239, 68, 68, 0.2)" }} onClick={() => handleRemoveStaff(s._id)}>
                          Revoke Access
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </div>
            
            <div className="map-card" style={{ marginTop: "24px" }}>
                <div className="section-head">
                  <h3>Active Restaurants List</h3>
                </div>
                <div className="table-flex">
                  {restaurants.map(r => (
                     <div key={r._id} className="t-card available" style={{ cursor: "default" }}>
                        <div className="t-head">{r.name}</div>
                        <p>{r.location || "N/A"}</p>
                        <div className="status-wrapper">
                            <span className={`status ${r.status === 'open' ? 'available' : 'occupied'}`}>{r.status}</span>
                            <span style={{color: 'var(--soft)', fontSize: '12px', marginTop: '4px'}}>Total Tables: {r.tables}</span>
                        </div>
                     </div>
                  ))}
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
