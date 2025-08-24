import express from "express";
import Market from "../models/Market.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, requireRole(["admin", "reporter"]), async (req, res) => {
  if (req.body.lat && req.body.lng) {
    req.body.location = {
      type: "Point",
      coordinates: [Number(req.body.lng), Number(req.body.lat)],
    };
  }
  const market = await Market.create(req.body);
  res.json(market);
});

router.get("/", async (req, res) => {
  const { lat, lng, radius } = req.query;
  // if lat/lng provided, perform proximity search (radius in km)
  if (lat && lng) {
    const r = Number(radius || 10) * 1000; // meters
    const markets = await Market.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: r,
        },
      },
    }).limit(100);
    return res.json(markets);
  }
  const { q, city, state } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  if (city) filter.city = city;
  if (state) filter.state = state;
  const markets = await Market.find(filter).sort({ name: 1 });
  res.json(markets);
});

export default router;
