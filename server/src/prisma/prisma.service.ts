import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect(); // Connect to the DB when NestJS starts
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Disconnect when NestJS stops
  }
}
