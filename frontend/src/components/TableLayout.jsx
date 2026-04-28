import React from "react";
import { Users } from "lucide-react";

export default function TableLayout({ tables, onTableSelect, selectedTableId, occupiedTables = [] }) {
  if (!tables || tables.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#667085", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "20px" }}>
        No tables available for this configuration.
      </div>
    );
  }

  return (
    <div className="table-layout-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "16px",
      padding: "10px"
    }}>
      {tables.map((table) => {
        const isOccupied = occupiedTables.includes(table.tableNumber) || table.status === "occupied";
        const isSelected = selectedTableId === table.tableNumber || selectedTableId === table._id;
        
        return (
          <button
            key={table._id || table.tableNumber}
            onClick={() => !isOccupied && onTableSelect(table)}
            disabled={isOccupied}
            style={{
              position: "relative",
              aspectRatio: "1/1",
              background: isSelected 
                ? "rgba(255, 122, 0, 0.2)" 
                : isOccupied 
                  ? "rgba(239, 68, 68, 0.05)" 
                  : "rgba(255, 255, 255, 0.03)",
              border: `1px solid ${
                isSelected 
                  ? "#ff7a00" 
                  : isOccupied 
                    ? "rgba(239, 68, 68, 0.2)" 
                    : "rgba(255, 255, 255, 0.08)"
              }`,
              borderRadius: "16px",
              padding: "16px",
              cursor: isOccupied ? "not-allowed" : "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              color: isOccupied ? "#667085" : "#fff",
              boxShadow: isSelected ? "0 0 20px rgba(255, 122, 0, 0.15)" : "none"
            }}
            onMouseOver={(e) => !isOccupied && !isSelected && (e.currentTarget.style.borderColor = "rgba(255, 122, 0, 0.5)")}
            onMouseOut={(e) => !isOccupied && !isSelected && (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)")}
          >
            <div style={{ 
              fontSize: "12px", 
              fontWeight: 800, 
              color: isSelected ? "#ff7a00" : isOccupied ? "#667085" : "#9aa4b2",
              letterSpacing: "1px"
            }}>
              T - {table.tableNumber}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Users size={14} color={isSelected ? "#ff7a00" : isOccupied ? "#667085" : "#fff"} />
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{table.capacity}</span>
            </div>

            {isOccupied && (
              <div style={{ 
                position: "absolute", 
                bottom: "12px", 
                fontSize: "10px", 
                fontWeight: 700, 
                color: "#ef4444", 
                textTransform: "uppercase" 
              }}>
                Occupied
              </div>
            )}

            {!isOccupied && !isSelected && (
              <div style={{ 
                position: "absolute", 
                bottom: "12px", 
                fontSize: "10px", 
                fontWeight: 700, 
                color: "#22c55e", 
                textTransform: "uppercase" 
              }}>
                Available
              </div>
            )}

            {isSelected && (
              <div style={{ 
                position: "absolute", 
                top: "-5px", 
                right: "-5px", 
                background: "#ff7a00", 
                width: "18px", 
                height: "18px", 
                borderRadius: "50%", 
                display: "grid", 
                placeItems: "center",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
              }}>
                <div style={{ width: "8px", height: "4px", borderLeft: "2px solid white", borderBottom: "2px solid white", transform: "rotate(-45deg) translateY(-1px)" }} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
