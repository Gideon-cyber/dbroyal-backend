import { PrismaService } from '../prisma/prisma.service';
import { Country } from '@prisma/client';
export declare class ClientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        email?: string;
        phone?: string;
        avatarUrl?: string;
        country?: Country;
    }): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(country?: Country): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }[]>;
    findOne(id: string, country?: Country): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: Partial<{
        name: string;
        email: string;
        phone: string;
        avatarUrl: string;
    }>, country?: Country): Promise<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }>;
    remove(id: string, country?: Country): Promise<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }>;
}
