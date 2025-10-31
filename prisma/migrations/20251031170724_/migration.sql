/*
  Warnings:

  - You are about to drop the column `avatar` on the `receptionist` table. All the data in the column will be lost.
  - Added the required column `avatar_id` to the `receptionist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "receptionist" DROP COLUMN "avatar",
ADD COLUMN     "avatar_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "avatar" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avatar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "receptionist" ADD CONSTRAINT "receptionist_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
