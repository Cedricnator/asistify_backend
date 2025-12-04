-- CreateTable
CREATE TABLE "call_history" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "client_name" VARCHAR(255) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "receptionist_id" TEXT NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_history_pkey" PRIMARY KEY ("id")
);
