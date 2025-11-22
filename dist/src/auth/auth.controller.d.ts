import { AuthService } from "./auth.service";
import { SignUpDto, LoginDto } from "./dto/create-auth.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<any>;
}
