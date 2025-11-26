import { Country } from "@prisma/client";
export declare class PackagePricingDto {
    country: Country;
    price: number;
    currency: string;
}
export declare class CreatePackageDto {
    name: string;
    slug: string;
    description?: string;
    features: string[];
    pricing: PackagePricingDto[];
    sortOrder?: number;
}
