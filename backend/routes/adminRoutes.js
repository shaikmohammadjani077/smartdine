import express from "express";
import { 
  getAdminRestaurants, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant, 
  getAdminAnalyticsRestaurants, 
  getAdminAnalyticsSummary, 
  getGlobalWaitlist, 
  getStaffUsers, 
  assignRestaurantToStaff, 
  getAdminBookings,
  getRestaurantTables,
  addRestaurantTable,
  deleteRestaurantTable,
  revokeStaffAccess
} from "../controllers/adminController.js";
import { auth, allow } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

const router = express.Router();

router.use(auth, allow("admin"));

router.get("/restaurants", asyncHandler(getAdminRestaurants));
router.post("/restaurants", asyncHandler(createRestaurant));
router.put("/restaurants/:id", asyncHandler(updateRestaurant));
router.delete("/restaurants/:id", asyncHandler(deleteRestaurant));
router.get("/analytics/restaurants", asyncHandler(getAdminAnalyticsRestaurants));
router.get("/analytics/summary", asyncHandler(getAdminAnalyticsSummary));
router.get("/waitlist", asyncHandler(getGlobalWaitlist));
router.get("/bookings", asyncHandler(getAdminBookings));
router.get("/staff", asyncHandler(getStaffUsers));
router.post("/staff/assign", asyncHandler(assignRestaurantToStaff));
router.put("/staff/:staffId/revoke", asyncHandler(revokeStaffAccess));

// Table Management
router.get("/restaurants/:id/tables", asyncHandler(getRestaurantTables));
router.post("/restaurants/:id/tables", asyncHandler(addRestaurantTable));
router.delete("/restaurants/:id/tables/:tableId", asyncHandler(deleteRestaurantTable));

export default router;
