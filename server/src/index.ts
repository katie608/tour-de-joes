import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { UPLOAD_ROOT } from "./storage";

import authRoutes from "./routes/auth";
import challengeRoutes from "./routes/challenges";
import storeRoutes from "./routes/stores";
import feedRoutes from "./routes/feed";
import scoreRoutes from "./routes/scores";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
app.use("/uploads", express.static(UPLOAD_ROOT));

app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
