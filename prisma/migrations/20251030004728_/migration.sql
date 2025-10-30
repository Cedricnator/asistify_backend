/*
  Warnings:

  - You are about to drop the column `subscriptionid` on the `enterprise` table. All the data in the column will be lost.
  - You are about to drop the column `recepcionist_id` on the `metric` table. All the data in the column will be lost.
  - You are about to drop the `recepcionist` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `receptionist_id` to the `metric` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."enterprise" DROP CONSTRAINT "enterprise_subscriptionid_fkey";

-- DropForeignKey
ALTER TABLE "public"."metric" DROP CONSTRAINT "metric_recepcionist_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."recepcionist" DROP CONSTRAINT "recepcionist_enterprise_id_fkey";

-- AlterTable
ALTER TABLE "enterprise" DROP COLUMN "subscriptionid",
ADD COLUMN     "subscription_id" TEXT;

-- AlterTable
ALTER TABLE "metric" DROP COLUMN "recepcionist_id",
ADD COLUMN     "receptionist_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."recepcionist";

-- CreateTable
CREATE TABLE "receptionist" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "avatar" TEXT,
    "cellphone" VARCHAR(15) NOT NULL,
    "enterprise_information" VARCHAR(255) NOT NULL,
    "client_information" VARCHAR(255) NOT NULL,
    "business_restrictions" VARCHAR(255) NOT NULL,
    "level_formality" INTEGER NOT NULL,
    "level_dynamism" INTEGER NOT NULL,
    "anticipation_max_days" INTEGER NOT NULL,
    "anticipation_min_days" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "enterprise_id" TEXT NOT NULL,

    CONSTRAINT "receptionist_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "receptionist" ADD CONSTRAINT "receptionist_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric" ADD CONSTRAINT "metric_receptionist_id_fkey" FOREIGN KEY ("receptionist_id") REFERENCES "receptionist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise" ADD CONSTRAINT "enterprise_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
