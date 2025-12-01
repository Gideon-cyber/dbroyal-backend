/*
  Warnings:

  - You are about to drop the column `country` on the `Service` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Service_country_idx";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "country";
