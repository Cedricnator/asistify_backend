/*
  Warnings:

  - The primary key for the `membership_functionality` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `funtionality_id` on the `membership_functionality` table. All the data in the column will be lost.
  - Added the required column `functionality_id` to the `membership_functionality` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."membership_functionality" DROP CONSTRAINT "membership_functionality_funtionality_id_fkey";

-- AlterTable
ALTER TABLE "membership_functionality" DROP CONSTRAINT "membership_functionality_pkey",
DROP COLUMN "funtionality_id",
ADD COLUMN     "functionality_id" TEXT NOT NULL,
ADD CONSTRAINT "membership_functionality_pkey" PRIMARY KEY ("membership_id", "functionality_id");

-- AddForeignKey
ALTER TABLE "membership_functionality" ADD CONSTRAINT "membership_functionality_functionality_id_fkey" FOREIGN KEY ("functionality_id") REFERENCES "functionality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
