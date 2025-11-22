import { Country } from "@prisma/client";
export declare class CreateClientDto {
    name: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    country?: Country;
}
