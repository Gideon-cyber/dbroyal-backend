import { ClientsService } from "./clients.service";
import { CreateClientDto, UpdateClientDto } from "./dto";
import { Country } from "@prisma/client";
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(country: Country, body: CreateClientDto): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(country: Country): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }[]>;
    findOne(country: Country, id: string): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(country: Country, id: string, body: UpdateClientDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        phone: string | null;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
    }>;
    remove(country: Country, id: string): Promise<{
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
