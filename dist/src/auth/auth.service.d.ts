import { JwtService } from "@nestjs/jwt";
import { SignUpDto, LoginDto } from "./dto/create-auth.dto";
import { PrismaService } from "../prisma/prisma.service";
export declare class AuthService {
    private jwtService;
    private prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    signUp(signUpDto: SignUpDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            phone: string;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            country: import(".prisma/client").$Enums.Country;
            phone: string;
        };
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string;
        country: import(".prisma/client").$Enums.Country;
    }>;
}
