import Restaurant from "../models/Restaurant.js";
import Booking from "../models/Booking.js";
import Table from "../models/Table.js";
import twilio from "twilio";

const getTwilioClient = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (err) {
      console.error("Twilio init error:", err);
      return null;
    }
  }
  return null;
};

export const getStaffDashboard = async (req, res) => {
  console.log("📊 Staff Dashboard Request - User:", { userId: req.user.id, restaurantId: req.user.restaurantId });
  
  if (!req.user.restaurantId) {
    console.warn("⚠️ Staff user has no restaurant assigned:", req.user.email);
    return res.json({ hotelName: "No Restaurant Assigned", tables: [], waitlist: [], error: "No restaurant assigned to this staff member" });
  }

  const restaurant = await Restaurant.findById(req.user.restaurantId).lean();
  if (!restaurant) {
    console.warn("⚠️ Restaurant not found for staff:", { restaurantId: req.user.restaurantId, email: req.user.email });
    return res.json({ hotelName: "Restaurant Not Found", tables: [], waitlist: [], error: "Assigned restaurant not found" });
  }

  const targetDate = req.query.date || new Date().toISOString().slice(0, 10);
  console.log("📅 Fetching bookings for:", { restaurantId: req.user.restaurantId, date: targetDate });

  const activeBookings = await Booking.find({
    restaurantId: req.user.restaurantId,
    date: targetDate,
    status: "seated",
    tableId: { $ne: "" },
  }).select("tableId userEmail time partySize").lean();

  const waitingBookings = await Booking.find({
    restaurantId: req.user.restaurantId,
    date: targetDate,
    status: { $in: ["waiting", "confirmed"] }
  }).select("userEmail time partySize status tableId").sort({ createdAt: 1 }).lean();

  console.log(`📈 Found ${activeBookings.length} active bookings and ${waitingBookings.length} waiting bookings`);

  const bookedMap = new Map();
  activeBookings.forEach((b) => {
    if (b.tableId) bookedMap.set(b.tableId, b);
  });

  const dbTables = await Table.find({ restaurantId: req.user.restaurantId }).sort({ tableNumber: 1 }).lean();

  const tables = dbTables.map((t) => {
    const booking = bookedMap.get(t.tableNumber);

    return {
      _id: t._id,
      name: t.tableNumber,
      capacity: t.capacity,
      status: booking ? "occupied" : "available",
      currentGuest: booking ? booking.userEmail.split("@")[0] : "",
      bookingTime: booking ? booking.time : "",
    };
  });

  res.json({
    hotelName: restaurant.name,
    tables,
    waitlist: waitingBookings.map((b) => ({
      _id: b._id,
      name: b.userEmail.split("@")[0],
      time: b.time,
      guests: b.partySize,
      tableId: b.tableId,
    })),
  });
};

export const assignTable = async (req, res) => {
  const { tableId, customerId } = req.body;

  if (!req.user.restaurantId) {
    return res.status(400).json({ message: "No restaurant assigned" });
  }

  if (!tableId || !customerId) {
    return res.status(400).json({ message: "tableId and customerId are required" });
  }

  const booking = await Booking.findOne({
    _id: customerId,
    restaurantId: req.user.restaurantId,
    status: { $in: ["waiting", "confirmed"] }
  });

  if (!booking) {
    return res.status(404).json({ message: "Waiting customer not found" });
  }

  const clash = await Booking.findOne({
    restaurantId: req.user.restaurantId,
    date: booking.date,
    time: booking.time,
    tableId,
    status: { $in: ["confirmed", "seated"] },
  }).lean();

  if (clash) {
    return res.status(400).json({ message: "Table already occupied for this slot" });
  }

  booking.tableId = tableId;
  booking.status = "seated";
  booking.staffId = req.user.id;
  await booking.save();

  // Send Twilio SMS if phone exists
  if (booking.phone && process.env.TWILIO_PHONE_NUMBER) {
    const client = getTwilioClient();
    if (client) {
      try {
        // Simple formatting to ensure number starts with +
        let toPhone = booking.phone.trim();
        if (!toPhone.startsWith("+")) {
          // Default to India (+91) since user is in IST, or just warn
          // For now, let's assume +91 if 10 digits, or just leave it
          if (toPhone.length === 10) toPhone = "+91" + toPhone;
          else if (!toPhone.startsWith("+")) console.log("Warning: Phone number might need country code starting with +");
        }

        console.log(`Attempting to send SMS to ${toPhone} from ${process.env.TWILIO_PHONE_NUMBER}`);

        const message = await client.messages.create({
          body: `Hi! Your table ${tableId} is ready at ${booking.restaurantName}. Please head to the host stand.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: toPhone,
        });
        console.log(`✅ SMS sent successfully! SID: ${message.sid}`);
      } catch (err) {
        console.error("❌ Twilio SMS failed:", err.message);
      }
    } else {
      console.log("Twilio client could not be initialized. Check your SID/Token.");
    }
  } else {
    console.log(`Skipping SMS: Phone: ${booking.phone}, Twilio Phone: ${process.env.TWILIO_PHONE_NUMBER}`);
  }

  res.json({ message: "Table assigned successfully" });
};

export const createWalkinBooking = async (req, res) => {
  const { partySize, guestName, date, time, phone } = req.body;

  if (!req.user.restaurantId) {
    return res.status(400).json({ message: "No restaurant assigned" });
  }

  if (!partySize || !guestName) {
    return res.status(400).json({ message: "partySize and guestName are required" });
  }

  const restaurant = await Restaurant.findById(req.user.restaurantId).lean();
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  const targetDate = date || new Date().toISOString().slice(0, 10);
  const targetTime = time || new Date().toTimeString().slice(0, 5);

  try {
    console.log("🚶 Adding walk-in booking:", { partySize, guestName, targetDate, targetTime });
    const booking = await Booking.create({
      userId: req.user.id,
      userEmail: `${guestName.toLowerCase().replace(/\s+/g, '')}@walkin.local`,
      phone: phone || "",
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      date: targetDate,
      time: targetTime,
      partySize: Number(partySize),
      tableId: "",
      totalAmount: 0,
      status: "waiting",
    });
    console.log("✅ Walk-in created:", booking._id);
    res.status(201).json({ message: "Walk-in added to waitlist", booking });
  } catch (error) {
    console.error("❌ Error in createWalkinBooking:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
