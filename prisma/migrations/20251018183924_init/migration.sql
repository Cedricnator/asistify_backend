-- CreateTable
CREATE TABLE "recepcionist" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "avatar" TEXT,
    "cellphone" VARCHAR(15) NOT NULL,
    "enterprise_information" VARCHAR(255) NOT NULL,
    "client_information" VARCHAR(255) NOT NULL,
    "business_restrictions" VARCHAR(255) NOT NULL,
    "level_formality" INTEGER NOT NULL,
    "level_dinamism" INTEGER NOT NULL,
    "max_days_antecipation" INTEGER NOT NULL,
    "antecipation_reservation_min_level" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "enterprise_id" TEXT NOT NULL,

    CONSTRAINT "recepcionist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric" (
    "id" TEXT NOT NULL,
    "model_used" VARCHAR(100) NOT NULL,
    "token_usage" INTEGER NOT NULL,
    "response_time" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "recepcionist_id" TEXT NOT NULL,

    CONSTRAINT "metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "avatar" TEXT,
    "phone_number" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,
    "subscriptionid" TEXT,

    CONSTRAINT "enterprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "extension_content" VARCHAR(50) NOT NULL,
    "size" INTEGER NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "document_type_id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "functionality" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "functionality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_funtionality" (
    "membership_id" TEXT NOT NULL,
    "funtionality_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_funtionality_pkey" PRIMARY KEY ("membership_id","funtionality_id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "mounth_duration" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "enterprise_id" TEXT NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "subscription_id" TEXT NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_category_name_key" ON "enterprise_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_name_key" ON "enterprise"("name");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_name_key" ON "document_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "functionality_name_key" ON "functionality"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_enterprise_id_key" ON "subscription"("enterprise_id");

-- AddForeignKey
ALTER TABLE "recepcionist" ADD CONSTRAINT "recepcionist_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric" ADD CONSTRAINT "metric_recepcionist_id_fkey" FOREIGN KEY ("recepcionist_id") REFERENCES "recepcionist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise" ADD CONSTRAINT "enterprise_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "enterprise_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise" ADD CONSTRAINT "enterprise_subscriptionid_fkey" FOREIGN KEY ("subscriptionid") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_funtionality" ADD CONSTRAINT "membership_funtionality_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_funtionality" ADD CONSTRAINT "membership_funtionality_funtionality_id_fkey" FOREIGN KEY ("funtionality_id") REFERENCES "functionality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
