import express from "express";
import FoodItem from "../models/FoodItem.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, requireRole(["admin", "reporter"]), async (req, res) => {
  const item = await FoodItem.create(req.body);
  res.json(item);
});

router.get("/", async (req, res) => {
  const { q } = req.query;
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const items = await FoodItem.find(filter).sort({ name: 1 });
  res.json(items);
});

export default router;
