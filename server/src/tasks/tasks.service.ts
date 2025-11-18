import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsService } from '../notification/notifications.service';
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createTask(data: any) {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description || undefined,
        status: data.status || 'PENDING',
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        projectId: data.projectId,
        assigneeId: data.assigneeId || undefined,
      },
    });

    // 1️⃣ Notify assignee if assigned
    if (data.assigneeId) {
      await this.notificationsService.notifyAssigneeTaskAssigned(
        task.id,
        task.projectId,
        task.title,
        data.assigneeId,
      );
    }

    return task;
  }
  //   async update(id: number, data: UpdateTaskDto) {
  //   return this.prisma.task.update({
  //     where: { id },
  //     data: {
  //       ...data,
  //       deadline: data.deadline ? new Date(data.deadline) : undefined,
  //     },
  //   });
  // }
  async update(id: number, data: UpdateTaskDto) {
    // 1. Fetch the current task state BEFORE the update
    const oldTask = await this.prisma.task.findUnique({
      where: { id },
      select: {
        assigneeId: true,
        title: true,
        projectId: true,
      },
    });

    if (!oldTask) {
      // Handle case where task doesn't exist (e.g., throw NotFoundException)
      throw new Error(`Task with ID ${id} not found.`);
    }

    // 2. Perform the update
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });

    // 3. Check for Assignee Change
    const newAssigneeId = data.assigneeId;
    const oldAssigneeId = oldTask.assigneeId;

    if (newAssigneeId !== oldAssigneeId) {
      // 4. Send notification to the new assignee
      if (newAssigneeId) {
        // Using the same notification method as in createTask (NotifyAssigneeTaskAssigned)
        await this.notificationsService.notifyAssigneeTaskAssigned(
          updatedTask.id,
          updatedTask.projectId,
          updatedTask.title,
          newAssigneeId,
        );
      }

      // OPTIONAL: Notify the OLD assignee they were unassigned/replaced
      // if (oldAssigneeId) {
      //   // You might need a new service method like notifyAssigneeTaskUnassigned
      // }
    }

    return updatedTask;
  }

  async getTasks() {
    return this.prisma.task.findMany({
      include: {
        assignee: true,
        project: { select: { id: true, name: true } },
      },
    });
  }

  async getTaskById(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) throw new NotFoundException(`Task with id ${id} not found`);
    return task;
  }

  async deleteTask(id: number) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
  async updateTaskStatus(taskId: number, status: string) {
    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      throw new Error('Invalid task status');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: status as TaskStatus },
      include: { assignee: true, project: true },
    });

    // 2️⃣ Notify admins only (not the assignee)
    await this.notificationsService.notifyAdminsForTaskStatusChange(
      updatedTask.id,
      updatedTask.projectId,
      updatedTask.title,
      status,
    );

    return updatedTask;
  }
}
