import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { config } from "./config.js";

import authRoutes from "./routes/auth.js";
import marketRoutes from "./routes/markets.js";
import foodRoutes from "./routes/foodItems.js";
import priceRoutes from "./routes/priceReports.js";
import statsRoutes from "./routes/stats.js";
import alertsRoutes from "./routes/alerts.js";

const app = express();

// ---------------------- MIDDLEWARE ----------------------

// Security headers
app.use(helmet());

// Logger
app.use(morgan("dev"));

// Parse JSON and URL-encoded data
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  "https://marketpricetnc.netlify.app",
  "https://foodprice.taskncart.shop", // Added your frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests for all routes
app.options("*", cors());

// ---------------------- ROUTES ----------------------

// Health check
app.get("/", (req, res) =>
  res.json({ ok: true, service: "Food Price Tracker API" })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/food-items", foodRoutes);
app.use("/api/price-reports", priceRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/alerts", alertsRoutes);

// ---------------------- DATABASE & SERVER ----------------------

mongoose
  .connect(config.mongoUri, { dbName: "food_price_tracker" })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(config.port, () =>
      console.log(`API running on port ${config.port}`)
    );
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });

// ---------------------- ERROR HANDLING ----------------------

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: err.message });
});
