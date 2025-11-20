-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('pending', 'active', 'past_due', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "enterprise_profile" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_profile_profile_id_enterprise_id_key" ON "enterprise_profile"("profile_id", "enterprise_id");

-- AddForeignKey
ALTER TABLE "enterprise_profile" ADD CONSTRAINT "enterprise_profile_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_profile" ADD CONSTRAINT "enterprise_profile_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
