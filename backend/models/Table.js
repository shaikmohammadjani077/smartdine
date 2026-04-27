import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    tableNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["available", "booked", "occupied"],
      default: "available",
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure table numbers are unique per restaurant
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

export default mongoose.model("Table", tableSchema);
