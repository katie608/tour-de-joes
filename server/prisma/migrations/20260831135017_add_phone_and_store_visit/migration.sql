-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "StoreVisit" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreVisit_storeId_teamId_key" ON "StoreVisit"("storeId", "teamId");

-- AddForeignKey
ALTER TABLE "StoreVisit" ADD CONSTRAINT "StoreVisit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreVisit" ADD CONSTRAINT "StoreVisit_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
