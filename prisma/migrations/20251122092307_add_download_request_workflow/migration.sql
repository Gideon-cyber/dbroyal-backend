/*
  Warnings:

  - Added the required column `updatedAt` to the `DownloadSelection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'PROCESSING_DELIVERY', 'SHIPPED', 'REJECTED');

-- AlterTable
ALTER TABLE "DownloadSelection" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "deliverables" TEXT,
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
ADD COLUMN     "photoCount" INTEGER,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "DownloadSelection_deliveryStatus_idx" ON "DownloadSelection"("deliveryStatus");

-- CreateIndex
CREATE INDEX "DownloadSelection_createdAt_idx" ON "DownloadSelection"("createdAt");
