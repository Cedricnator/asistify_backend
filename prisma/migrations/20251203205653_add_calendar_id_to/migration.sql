-- DropForeignKey
ALTER TABLE "public"."enterprise_profile" DROP CONSTRAINT "enterprise_profile_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."enterprise_profile" DROP CONSTRAINT "enterprise_profile_profile_id_fkey";

-- AlterTable
ALTER TABLE "enterprise" ADD COLUMN "calendar_id" TEXT ;

-- CreateIndex
DROP INDEX IF EXISTS "enterprise_profile_profile_id_enterprise_id_key";
CREATE UNIQUE INDEX "enterprise_profile_profile_id_enterprise_id_key" ON "enterprise_profile"("profile_id", "enterprise_id");

-- AddForeignKey
ALTER TABLE "enterprise_profile" ADD CONSTRAINT "enterprise_profile_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_profile" ADD CONSTRAINT "enterprise_profile_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;