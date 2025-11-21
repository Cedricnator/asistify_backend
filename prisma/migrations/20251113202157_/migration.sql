/*
  Warnings:

  - You are about to drop the column `password` on the `profile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."document" DROP CONSTRAINT "document_document_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."document" DROP CONSTRAINT "document_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."enterprise" DROP CONSTRAINT "enterprise_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."enterprise" DROP CONSTRAINT "enterprise_subscription_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."membership_functionality" DROP CONSTRAINT "membership_functionality_functionality_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."membership_functionality" DROP CONSTRAINT "membership_functionality_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."metric" DROP CONSTRAINT "metric_receptionist_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_subscription_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile" DROP CONSTRAINT "profile_role_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."receptionist" DROP CONSTRAINT "receptionist_avatar_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."receptionist" DROP CONSTRAINT "receptionist_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscription" DROP CONSTRAINT "subscription_membership_id_fkey";

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "password";

-- AddForeignKey
ALTER TABLE "receptionist" ADD CONSTRAINT "receptionist_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "avatar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receptionist" ADD CONSTRAINT "receptionist_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric" ADD CONSTRAINT "metric_receptionist_id_fkey" FOREIGN KEY ("receptionist_id") REFERENCES "receptionist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise" ADD CONSTRAINT "enterprise_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "enterprise_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_functionality" ADD CONSTRAINT "membership_functionality_functionality_id_fkey" FOREIGN KEY ("functionality_id") REFERENCES "functionality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_functionality" ADD CONSTRAINT "membership_functionality_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
