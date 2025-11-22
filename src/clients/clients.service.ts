import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; email?: string; phone?: string; avatarUrl?: string; country?: Country }) {
    return this.prisma.client.create({ data });
  }

  findAll(country?: Country) {
    return this.prisma.client.findMany({
      where: country ? { country } : undefined,
    });
  }

  findOne(id: string, country?: Country) {
    return this.prisma.client.findUnique({
      where: country ? { id, country } : { id },
    });
  }

  async update(id: string, data: Partial<{ name: string; email: string; phone: string; avatarUrl: string }>, country?: Country) {
    // Verify ownership before updating
    if (country) {
      const client = await this.prisma.client.findFirst({
        where: { id, country },
      });
      if (!client) {
        throw new Error('Client not found');
      }
    }

    return this.prisma.client.update({ where: { id }, data });
  }

  async remove(id: string, country?: Country) {
    // Verify ownership before deleting
    if (country) {
      const client = await this.prisma.client.findFirst({
        where: { id, country },
      });
      if (!client) {
        throw new Error('Client not found');
      }
    }

    return this.prisma.client.delete({ where: { id } });
  }
}