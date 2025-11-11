/*
  Warnings:

  - You are about to drop the `membership_funtionality` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."membership_funtionality" DROP CONSTRAINT "membership_funtionality_funtionality_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."membership_funtionality" DROP CONSTRAINT "membership_funtionality_membership_id_fkey";

-- DropTable
DROP TABLE "public"."membership_funtionality";

-- CreateTable
CREATE TABLE "membership_functionality" (
    "membership_id" TEXT NOT NULL,
    "funtionality_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_functionality_pkey" PRIMARY KEY ("membership_id","funtionality_id")
);

-- AddForeignKey
ALTER TABLE "membership_functionality" ADD CONSTRAINT "membership_functionality_funtionality_id_fkey" FOREIGN KEY ("funtionality_id") REFERENCES "functionality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_functionality" ADD CONSTRAINT "membership_functionality_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
