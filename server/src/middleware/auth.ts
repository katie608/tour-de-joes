import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

declare global {
  namespace Express {
    interface Request {
      team?: { id: number; name: string; unspentPoints: number };
      isAdmin?: boolean;
    }
  }
}

/** Requires a valid session token (team or admin). */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const session = await prisma.sessionToken.findUnique({ where: { token } });
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (session.teamId === null) {
    req.isAdmin = true;
    return next();
  }

  const team = await prisma.team.findUnique({ where: { id: session.teamId } });
  if (!team) {
    return res.status(401).json({ error: "Invalid session" });
  }

  req.team = { id: team.id, name: team.name, unspentPoints: team.unspentPoints };
  next();
}

/** Requires the session to belong to the admin account. */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!req.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}
