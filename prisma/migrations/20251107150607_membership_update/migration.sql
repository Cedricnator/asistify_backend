/*
  Warnings:

  - You are about to drop the column `description` on the `functionality` table. All the data in the column will be lost.
  - You are about to drop the column `enterprise_id` on the `membership` table. All the data in the column will be lost.
  - You are about to drop the column `profile_id` on the `membership` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `membership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `membership` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membership_id` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "functionality" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "membership" DROP COLUMN "enterprise_id",
DROP COLUMN "profile_id",
DROP COLUMN "role",
ADD COLUMN     "description" VARCHAR(255) NOT NULL,
ADD COLUMN     "name" VARCHAR(100) NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "membership_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "membership_name_key" ON "membership"("name");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
