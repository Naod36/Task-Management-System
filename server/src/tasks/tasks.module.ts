import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskReportsModule } from './task-reports.module';
import { NotificationsModule } from '../notification/notifications.module';

@Module({
  imports: [PrismaModule, TaskReportsModule, NotificationsModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
