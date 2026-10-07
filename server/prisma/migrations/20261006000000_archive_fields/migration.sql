ALTER TABLE "StoreVisit" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "StoreVisit" ADD COLUMN "gameLabel" TEXT;
ALTER TABLE "Completion" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Completion" ADD COLUMN "gameLabel" TEXT;
