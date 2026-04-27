import express from "express";
import { getRestaurants } from "../controllers/restaurantController.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

const router = express.Router();

router.get("/", asyncHandler(getRestaurants));
router.get("/:id/tables", asyncHandler(async (req, res) => {
  const Table = (await import("../models/Table.js")).default;
  const tables = await Table.find({ restaurantId: req.params.id }).sort({ tableNumber: 1 }).lean();
  res.json(tables);
}));

export default router;
