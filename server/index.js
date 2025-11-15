import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import { fileURLToPath } from "url";
import PorfileRoutes from "./routes/profileRoute.js"
import eventRoutes from "./routes/eventRoute.js"

dotenv.config();

const app = express();

const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();


//routes

app.use("/api/profiles", PorfileRoutes)
app.use("/api/events",eventRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API alive" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  // app.get("*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "../client/build/index.html"));
  // });
}

const PORT = process.env.PORT || 5014;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
