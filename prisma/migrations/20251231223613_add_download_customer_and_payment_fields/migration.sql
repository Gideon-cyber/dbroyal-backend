/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `DownloadSelection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DownloadSelection" ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "paymentAmount" DECIMAL(10,2),
ADD COLUMN     "paymentCurrency" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentProofUrl" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "paymentVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "paymentVerifiedBy" TEXT,
ADD COLUMN     "photoDeliveryFormats" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DownloadSelection_stripePaymentIntentId_key" ON "DownloadSelection"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "DownloadSelection_paymentStatus_idx" ON "DownloadSelection"("paymentStatus");
