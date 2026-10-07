import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import { getGameState } from "./lib/gameState";
import challengeRoutes from "./routes/challenges";
import storeRoutes from "./routes/stores";
import feedRoutes from "./routes/feed";
import scoreRoutes from "./routes/scores";
import adminRoutes from "./routes/admin";
import archiveRoutes from "./routes/archive";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/archive", archiveRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/game-state", async (_req, res) => res.json({ state: await getGameState() }));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
