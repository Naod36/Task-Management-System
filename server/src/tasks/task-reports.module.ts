import { Module } from '@nestjs/common';
import { TaskReportsService } from './task-reports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notification/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [TaskReportsService],
  exports: [TaskReportsService], // <-- export it so TasksModule can use it
})
export class TaskReportsModule {}
