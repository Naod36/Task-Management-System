import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notification/notifications.service';

@Injectable()
export class TaskReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createReport(taskId: number, userId: number, message: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const report = await this.prisma.taskReport.create({
      data: { message, taskId, userId },
    });

    // Notify all admins
    await this.notificationsService.notifyAdminsForReport(
      taskId,
      task.projectId,
      task.title,
    );

    return report;
  }

  async getReports(taskId: number) {
    return this.prisma.taskReport.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });
  }
  async getReportsByTask(taskId: number) {
    return this.prisma.taskReport.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async markAsSeen(id: number) {
    return this.prisma.taskReport.update({
      where: { id },
      data: { seen: true }, // ✅ now valid
    });
  }
}
