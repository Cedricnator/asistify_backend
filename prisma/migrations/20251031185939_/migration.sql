-- AlterTable
ALTER TABLE "receptionist" ALTER COLUMN "enterprise_information" DROP NOT NULL,
ALTER COLUMN "client_information" DROP NOT NULL,
ALTER COLUMN "business_restrictions" DROP NOT NULL;
