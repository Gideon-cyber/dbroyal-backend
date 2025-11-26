import { Country } from "@prisma/client";
export declare class CreateServiceDto {
    title: string;
    slug: string;
    description: string;
    subtitle?: string;
    imageUrl?: string;
    isVisible?: boolean;
    country?: Country;
}
