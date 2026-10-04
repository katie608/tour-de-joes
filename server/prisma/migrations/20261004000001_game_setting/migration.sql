CREATE TABLE "GameSetting" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "state" TEXT NOT NULL DEFAULT 'pending',
  CONSTRAINT "GameSetting_pkey" PRIMARY KEY ("id")
);
INSERT INTO "GameSetting" ("id", "state") VALUES (1, 'pending') ON CONFLICT DO NOTHING;
