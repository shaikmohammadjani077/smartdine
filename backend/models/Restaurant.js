import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    location: { type: String, default: "", trim: true },
    contactNumber: { type: String, default: "" },
    tables: { type: Number, default: 10, min: 1 },
    tableTypes: {
      type: [{ capacity: Number, count: Number }],
      default: []
    },
    pricePerSeat: { type: Number, default: 150, min: 0 },
    image: { type: String, default: "/dinesmart-logo.png" },
    tag: { type: String, default: "" },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    menu: { type: [String], default: [] },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    openingTime: { type: String, default: "09:00" },
    closingTime: { type: String, default: "22:00" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", RestaurantSchema);
