import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
    phone?: string;
    countryCode?: string;
  }) {
    // Hash password if it's not already hashed
    const hashedPassword = data.passwordHash.startsWith("$2")
      ? data.passwordHash
      : await bcrypt.hash(data.passwordHash, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        passwordHash: hashedPassword,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(
    id: string,
    data: Partial<{ name: string; email: string; role: Role; phone: string }>
  ) {
    return this.prisma.user.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
