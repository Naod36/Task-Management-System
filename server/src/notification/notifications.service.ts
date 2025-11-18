import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Fetch all notifications for a user
  async getUserNotifications(userId: number) {
    // Safety check
    if (!userId) {
      return []; // Return empty array instead of fetching everything
    }

    return this.prisma.notification.findMany({
      where: { userId: userId }, // Explicit mapping
      orderBy: { createdAt: 'desc' },
    });
  }

  // Mark a single notification as read (optional)
  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  // Mark all notifications for a user as read
  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  // Create a single notification
  async createNotification(
    userId: number,
    message: string,
    taskId?: number,
    projectId?: number,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        message,
        taskId,
        projectId,
      },
    });
  }

  // Create notifications for multiple users at once
  async createNotificationsForUsers(
    userIds: number[],
    message: string,
    taskId?: number,
    projectId?: number,
  ) {
    const notifications = userIds.map((id) => ({
      userId: id,
      message,
      taskId,
      projectId,
    }));
    return this.prisma.notification.createMany({ data: notifications });
  }

  // --- Helper methods for your main 4 use cases ---

  // 1️⃣ Notify all admins for a new report
  async notifyAdminsForReport(
    taskId: number,
    projectId: number,
    taskTitle: string,
  ) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });
    return this.createNotificationsForUsers(
      admins.map((a) => a.id),
      `New report on task "${taskTitle}"`,
      taskId,
      projectId,
    );
  }

  // 2️⃣ Notify assignee when task status changes
  async notifyAssigneeStatusChange(
    taskId: number,
    projectId: number,
    taskTitle: string,
    assigneeId: number,
    newStatus: string,
  ) {
    return this.createNotification(
      assigneeId,
      `The task addigned to you status changed from "${taskTitle}" to  ${newStatus}`,
      taskId,
      projectId,
    );
  }

  // 3️⃣ Notify assignee when assigned a task
  async notifyAssigneeTaskAssigned(
    taskId: number,
    projectId: number,
    taskTitle: string,
    assigneeId: number,
  ) {
    return this.createNotification(
      assigneeId,
      `You have been assigned task "${taskTitle}"`,
      taskId,
      projectId,
    );
  }

  // 4️⃣ Notify all users assigned to a project when project is finished
  async notifyProjectFinished(projectId: number, projectName: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!project) return;

    const userIds = Array.from(
      new Set(
        project.tasks.map((t) => t.assigneeId).filter(Boolean) as number[],
      ),
    );

    if (userIds.length > 0) {
      return this.createNotificationsForUsers(
        userIds,
        `Project "${projectName}" has been marked as finished`,
        undefined,
        projectId,
      );
    }
  }
  // Notify all admins about task status change
  async notifyAdminsForTaskStatusChange(
    taskId: number,
    projectId: number,
    taskTitle: string,
    newStatus: string,
  ) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });
    if (!admins.length) return;

    return this.createNotificationsForUsers(
      admins.map((a) => a.id),
      `Task "${taskTitle}" status changed to ${newStatus}`,
      taskId,
      projectId,
    );
  }
}
