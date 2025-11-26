import { Country } from "@prisma/client";
export declare class CreateEventDto {
    name: string;
    slug?: string;
    serviceId: string;
    description?: string;
    date?: string;
    location?: string;
    coverImageUrl?: string;
    googleDriveUrl?: string;
    clientId?: string;
    country?: Country;
}
