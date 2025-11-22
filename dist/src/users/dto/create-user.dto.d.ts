import { Role } from "@prisma/client";
export declare class CreateUserDto {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
    phone?: string;
    countryCode?: string;
}
