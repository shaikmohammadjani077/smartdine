import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Table from "../models/Table.js";
import { restaurantPayload } from "../utils/helpers.js";

export const getAdminRestaurants = async (req, res) => {
  res.json(await Restaurant.find().sort({ createdAt: -1 }).lean());
};

export const getAdminBookings = async (req, res) => {
  const { restaurantId, date } = req.query;
  let filter = {};
  
  if (restaurantId) filter.restaurantId = restaurantId;
  if (date) filter.date = date;
  
  const bookings = await Booking.find(filter)
    .sort({ date: -1, time: -1 })
    .lean();
  
  console.log(`📊 Admin fetched ${bookings.length} bookings with filter:`, filter);
  res.json(bookings);
};

export const createRestaurant = async (req, res) => {
  const data = restaurantPayload(req.body);
  if (!data.name) return res.status(400).json({ message: "Restaurant name is required" });

  const exists = await Restaurant.findOne({
    name: { $regex: `^${data.name}$`, $options: "i" },
  }).lean();

  if (exists) return res.status(400).json({ message: "Restaurant already exists" });

  let totalTablesCount = 0;
  if (data.tableTypes && data.tableTypes.length > 0) {
    totalTablesCount = data.tableTypes.reduce((acc, t) => acc + (t.count || 0), 0);
  } else {
    totalTablesCount = data.tables || 10;
  }

  const restaurant = await Restaurant.create({ 
    ...data, 
    tables: totalTablesCount 
  });

  const generatedTables = [];
  let tableIndex = 1;

  if (data.tableTypes && data.tableTypes.length > 0) {
    data.tableTypes.forEach(type => {
      const count = type.count || 0;
      for (let i = 0; i < count; i++) {
        generatedTables.push({
          restaurantId: restaurant._id,
          tableNumber: `T${tableIndex++}`,
          capacity: type.capacity || 2,
        });
      }
    });
  } else {
    for (let i = 0; i < totalTablesCount; i++) {
      generatedTables.push({
        restaurantId: restaurant._id,
        tableNumber: `T${tableIndex++}`,
        capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
      });
    }
  }

  await Table.insertMany(generatedTables);

  res.status(201).json({ message: "Restaurant added successfully", restaurant });
};

export const updateRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    restaurantPayload(req.body),
    { new: true, runValidators: true }
  );

  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

  if (req.body.name !== undefined) {
    await Promise.all([
      User.updateMany(
        { role: "staff", restaurantId: restaurant._id },
        { $set: { restaurantName: restaurant.name } }
      ),
      Booking.updateMany(
        { restaurantId: restaurant._id },
        { $set: { restaurantName: restaurant.name } }
      ),
    ]);
  }

  res.json({ message: "Restaurant updated successfully", restaurant });
};

export const deleteRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

  await User.updateMany(
    { role: "staff", restaurantId: restaurant._id },
    { $set: { restaurantId: null, restaurantName: "" } }
  );

  res.json({ message: "Restaurant deleted successfully" });
};

export const getAdminAnalyticsRestaurants = async (req, res) => {
  res.json(await Booking.aggregate([
    { $match: { status: { $in: ["confirmed", "seated"] } } },
    {
      $group: {
        _id: { restaurantId: "$restaurantId", restaurantName: "$restaurantName" },
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        totalGuests: { $sum: "$partySize" },
      },
    },
    {
      $project: {
        _id: 0,
        restaurantId: "$_id.restaurantId",
        restaurantName: "$_id.restaurantName",
        totalBookings: 1,
        totalRevenue: 1,
        totalGuests: 1,
      },
    },
    { $sort: { totalBookings: -1, totalRevenue: -1 } },
  ]));
};

export const getAdminAnalyticsSummary = async (req, res) => {
  const [totalRestaurants, activeRestaurants, totalBookings, confirmedBookings, revenueData] =
    await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ["confirmed", "seated"] } }),
      Booking.aggregate([
        { $match: { status: { $in: ["confirmed", "seated"] } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
    ]);
  res.json({
    totalRestaurants,
    activeRestaurants,
    totalBookings,
    confirmedBookings,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
  });
};

export const getGlobalWaitlist = async (req, res) => {
  const waitlist = await Booking.find({
    $or: [
      { status: "waiting" },
      { status: "confirmed", tableId: "" },
      { status: "confirmed", tableId: { $exists: false } }
    ]
  }).sort({ date: 1, time: 1 }).lean();

  res.json(waitlist);
};

export const getStaffUsers = async (req, res) => {
  const staffUsers = await User.find({ role: "staff" })
    .select("email restaurantId restaurantName createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.json(staffUsers);
};

export const assignRestaurantToStaff = async (req, res) => {
  const { staffUserId, restaurantId } = req.body;

  if (!staffUserId || !restaurantId) {
    return res.status(400).json({ message: "staffUserId and restaurantId are required" });
  }

  const staffUser = await User.findOne({ _id: staffUserId, role: "staff" });
  if (!staffUser) {
    return res.status(404).json({ message: "Staff user not found" });
  }

  const restaurant = await Restaurant.findOne({ _id: restaurantId, isActive: true }).lean();
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found or inactive" });
  }

  staffUser.restaurantId = restaurantId;
  staffUser.restaurantName = restaurant.name;
  await staffUser.save();

  res.json({ message: "Restaurant assigned successfully", user: staffUser });
};

export const getRestaurantTables = async (req, res) => {
  const tables = await Table.find({ restaurantId: req.params.id }).sort({ tableNumber: 1 }).lean();
  res.json(tables);
};

export const addRestaurantTable = async (req, res) => {
  const { tableNumber, capacity } = req.body;
  if (!tableNumber || !capacity) return res.status(400).json({ message: "Table number and capacity are required" });

  const table = await Table.create({
    restaurantId: req.params.id,
    tableNumber,
    capacity: Number(capacity),
  });

  res.status(201).json({ message: "Table added successfully", table });
};

export const deleteRestaurantTable = async (req, res) => {
  const table = await Table.findByIdAndDelete(req.params.tableId);
  if (!table) return res.status(404).json({ message: "Table not found" });
  res.json({ message: "Table deleted successfully" });
};

export const revokeStaffAccess = async (req, res) => {
  const staff = await User.findOneAndUpdate(
    { _id: req.params.staffId, role: "staff" },
    { $set: { restaurantId: null, restaurantName: "" } },
    { new: true }
  );
  if (!staff) return res.status(404).json({ message: "Staff user not found" });
  res.json({ message: "Staff access revoked successfully", user: staff });
};
