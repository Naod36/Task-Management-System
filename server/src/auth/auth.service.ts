import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role };
    return { access_token: this.jwt.sign(payload) };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashed,
        role: data.role === 'ADMIN' ? UserRole.ADMIN : UserRole.MEMBER, // convert string to enum
      },
    });
    return this.login(user);
  }
}
