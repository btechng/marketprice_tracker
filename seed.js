import mongoose from "mongoose";
import { config } from "./src/config.js"; // ✅ named import
import FoodItem from "./src/models/FoodItem.js";
import Market from "./src/models/Market.js";

async function seed() {
  await mongoose.connect(config.mongoUri, { dbName: "food_price_tracker" });
  console.log("✅ Connected to DB");

  // Clear old data (optional)
  await FoodItem.deleteMany({});
  await Market.deleteMany({});

  // Insert markets
  const markets = await Market.insertMany([
    { name: "Mile 12 Market", city: "Lagos" },
    { name: "Oyingbo Market", city: "Lagos" },
    { name: "Ariaria Market", city: "Aba" },
    { name: "Wuse Market", city: "Abuja" },
    { name: "Douglass Market", city: "Owerri" },
    { name: "Worldbank Market", city: "Owerri" },
    { name: "Rochas Market", city: "Owerri" },
  ]);

  // Insert food items
  const foodItems = await FoodItem.insertMany([
    { name: "Tomatoes" },
    { name: "Onions" },
    { name: "Rice" },
    { name: "Beans" },
    { name: "Yam" },
    { name: "Garri" },
  ]);

  console.log("🌽 Seeded Markets:", markets.length);
  console.log("🥕 Seeded Food Items:", foodItems.length);

  await mongoose.disconnect();
  console.log("🚀 Seeding done!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
