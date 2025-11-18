import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(name: string, email: string) {
    return this.prisma.user.create({
      data: { name, email },
    });
  }

  getUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
  }

  getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  // Update role
  updateUserRole(id: number, role: 'ADMIN' | 'MEMBER') {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  // Delete user
  deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
