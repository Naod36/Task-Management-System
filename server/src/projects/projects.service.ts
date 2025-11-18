import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { NotificationsService } from '../notification/notifications.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createProject(data: any) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        tasks: data.tasks ? data.tasks : undefined, // allows tasks.create
      },
      include: {
        tasks: {
          include: { assignee: true },
        },
      },
    });
  }

  async getProjects() {
    return this.prisma.project.findMany({
      include: {
        tasks: {
          include: { assignee: true },
        },
      },
      orderBy: { id: 'desc' },
    });
  }
  async updateProject(id: number, data: any) {
    return this.prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,

        tasks: {
          // Delete tasks
          deleteMany: data.tasks?.delete
            ? data.tasks.delete.map((taskId: number) => ({ id: taskId }))
            : undefined,

          // Create new tasks
          create: data.tasks?.create
            ? data.tasks.create.map((t: any) => ({
                title: t.title,
                description: t.description || undefined,
                status: t.status || 'PENDING',
                assigneeId: t.assigneeId || undefined,
                deadline: t.deadline ? new Date(t.deadline) : undefined,
              }))
            : undefined,

          // Update existing tasks
          update: data.tasks?.update
            ? data.tasks.update.map((t: any) => ({
                where: { id: t.id },
                data: {
                  title: t.title,
                  description: t.description || undefined,
                  status: t.status || 'PENDING',
                  assigneeId: t.assigneeId || undefined,
                  deadline: t.deadline ? new Date(t.deadline) : undefined,
                },
              }))
            : undefined,
        },
      },
      include: {
        tasks: {
          include: { assignee: true },
        },
      },
    });
  }

  async deleteProject(id: number) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
  async getProjectsForUser(userId: number, role: UserRole) {
    if (role === 'ADMIN') {
      return this.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    // MEMBER → only projects where they have tasks
    return this.prisma.project.findMany({
      where: {
        tasks: {
          some: {
            assigneeId: userId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async finishProject(id: number) {
    const project = await this.prisma.project.update({
      where: { id },
      data: { finished: true },
      include: { tasks: true },
    });

    // Notify all assigned users
    await this.notificationsService.notifyProjectFinished(
      project.id,
      project.name,
    );

    return project;
  }
}
