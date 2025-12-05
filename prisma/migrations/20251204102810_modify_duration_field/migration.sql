/*
  Warnings:

  - You are about to drop the column `duration_minutes` on the `call_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "call_history" DROP COLUMN "duration_minutes",
ADD COLUMN     "duration_seconds" INTEGER NOT NULL DEFAULT 0;
