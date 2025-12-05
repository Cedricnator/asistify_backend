-- AddForeignKey
ALTER TABLE "call_history" ADD CONSTRAINT "call_history_receptionist_id_fkey" FOREIGN KEY ("receptionist_id") REFERENCES "receptionist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
