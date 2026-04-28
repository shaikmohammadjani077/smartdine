import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import AdminPanel from "../components/dashboard/AdminPanel";
import StaffPanel from "../components/dashboard/StaffPanel";

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      navigate("/");
      return;
    }

    if (userRole !== "staff" && userRole !== "admin") {
      navigate("/");
      return;
    }

    setRole(userRole);
  }, [navigate]);

  if (!role) return null;

  return role === "admin" ? <AdminPanel /> : <StaffPanel />;
}