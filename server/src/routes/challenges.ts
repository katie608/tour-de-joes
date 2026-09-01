import { Router } from "express";
import multer from "multer";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { saveUpload } from "../storage";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 150 * 1024 * 1024 } });

router.use(requireAuth);

router.get("/", async (req, res) => {
  const teamId = req.team!.id;
  const challenges = await prisma.challenge.findMany({ orderBy: { sortOrder: "asc" } });
  const completions = await prisma.completion.groupBy({
    by: ["challengeId"],
    where: { teamId },
    _count: { _all: true },
  });
  const countByChallenge = new Map(completions.map((c) => [c.challengeId, c._count._all]));

  const enriched = challenges.map((c) => {
    const completedCount = countByChallenge.get(c.id) ?? 0;
    const isComplete = c.repeatable ? (c.repeatLimit != null && completedCount >= c.repeatLimit) : completedCount >= 1;
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      pointValue: c.pointValue,
      mediaRequired: c.mediaRequired,
      repeatable: c.repeatable,
      repeatLimit: c.repeatLimit,
      sortOrder: c.sortOrder,
      completedCount,
      isComplete,
    };
  });

  enriched.sort((a, b) => {
    if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
    return a.sortOrder - b.sortOrder;
  });

  res.json(enriched);
});

router.get("/:id", async (req, res) => {
  const teamId = req.team!.id;
  const challenge = await prisma.challenge.findUnique({ where: { id: Number(req.params.id) } });
  if (!challenge) return res.status(404).json({ error: "Challenge not found" });

  const completedCount = await prisma.completion.count({ where: { teamId, challengeId: challenge.id } });
  const isComplete = challenge.repeatable
    ? (challenge.repeatLimit != null && completedCount >= challenge.repeatLimit)
    : completedCount >= 1;

  res.json({ ...challenge, completedCount, isComplete });
});

router.post("/:id/complete", upload.single("media"), async (req, res) => {
  const teamId = req.team!.id;
  const challenge = await prisma.challenge.findUnique({ where: { id: Number(req.params.id) } });
  if (!challenge) return res.status(404).json({ error: "Challenge not found" });

  const completedCount = await prisma.completion.count({ where: { teamId, challengeId: challenge.id } });

  if (challenge.repeatable) {
    if (challenge.repeatLimit != null && completedCount >= challenge.repeatLimit) {
      return res.status(400).json({ error: "Challenge already fully completed" });
    }
  } else if (completedCount >= 1) {
    return res.status(400).json({ error: "Challenge already completed" });
  }

  if (challenge.mediaRequired && !req.file) {
    return res.status(400).json({ error: "Media is required for this challenge" });
  }

  let mediaUrl: string | null = null;
  if (req.file) {
    mediaUrl = await saveUpload(challenge.title, req.team!.name, req.file);
  }

  const [completion] = await prisma.$transaction([
    prisma.completion.create({
      data: { teamId, challengeId: challenge.id, mediaUrl },
    }),
    prisma.team.update({
      where: { id: teamId },
      data: { unspentPoints: { increment: challenge.pointValue } },
    }),
  ]);

  const newCompletedCount = completedCount + 1;
  const isComplete = challenge.repeatable
    ? (challenge.repeatLimit != null && newCompletedCount >= challenge.repeatLimit)
    : true;

  res.status(201).json({ completion, completedCount: newCompletedCount, isComplete });
});

export default router;
