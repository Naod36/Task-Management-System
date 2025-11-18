-- DropForeignKey
ALTER TABLE "TaskReport" DROP CONSTRAINT "TaskReport_taskId_fkey";

-- AddForeignKey
ALTER TABLE "TaskReport" ADD CONSTRAINT "TaskReport_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
