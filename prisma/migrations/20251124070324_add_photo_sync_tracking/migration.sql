/*
  Warnings:

  - Added the required column `updatedAt` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('NEVER_SYNCED', 'SYNCING', 'UP_TO_DATE', 'ERROR', 'SYNC_REQUIRED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "driveChangeToken" TEXT,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "syncErrorMessage" TEXT,
ADD COLUMN     "syncStatus" "SyncStatus" NOT NULL DEFAULT 'NEVER_SYNCED';

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "fileSize" BIGINT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "width" INTEGER;

-- CreateIndex
CREATE INDEX "Event_syncStatus_idx" ON "Event"("syncStatus");

-- CreateIndex
CREATE INDEX "Event_lastSyncedAt_idx" ON "Event"("lastSyncedAt");
