import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

export type GameState = "pending" | "active" | "ended";

export async function getGameState(): Promise<GameState> {
  const setting = await prisma.gameSetting.findUnique({ where: { id: 1 } });
  return (setting?.state ?? "pending") as GameState;
}

export async function setGameState(state: GameState): Promise<void> {
  await prisma.gameSetting.upsert({
    where: { id: 1 },
    create: { id: 1, state },
    update: { state },
  });
}

export async function requireGameActive(req: Request, res: Response, next: NextFunction) {
  if (req.isAdmin) return next();
  const state = await getGameState();
  if (state === "pending") return res.status(403).json({ error: "The game has not started yet." });
  if (state === "ended") return res.status(403).json({ error: "The game has ended." });
  next();
}
