"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BookingsService = class BookingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const { assignedUserIds, ...rest } = data;
        if (typeof rest.dateTime === "string")
            rest.dateTime = new Date(rest.dateTime);
        const packageWithPricing = await this.prisma.package.findUnique({
            where: { id: data.packageId },
            include: {
                pricing: {
                    where: { country: data.country || client_1.Country.NG },
                },
            },
        });
        if (!packageWithPricing) {
            throw new Error("Package not found");
        }
        const pricing = packageWithPricing.pricing[0];
        const bookingData = {
            ...rest,
            price: pricing?.price,
            currency: pricing?.currency,
        };
        return this.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.create({
                data: bookingData,
                include: {
                    package: {
                        include: {
                            service: true,
                            features: {
                                orderBy: { sortOrder: "asc" },
                            },
                            pricing: true,
                        },
                    },
                    client: true,
                    event: true,
                },
            });
            if (assignedUserIds?.length) {
                await tx.bookingAssignment.createMany({
                    data: assignedUserIds.map((userId) => ({
                        bookingId: booking.id,
                        userId,
                    })),
                });
            }
            return tx.booking.findUnique({
                where: { id: booking.id },
                include: {
                    assigned: true,
                    client: true,
                    event: true,
                    package: {
                        include: {
                            service: true,
                            features: {
                                orderBy: { sortOrder: "asc" },
                            },
                            pricing: true,
                        },
                    },
                },
            });
        });
    }
    findAll(country, startDate, endDate) {
        const where = country ? { country } : {};
        if (startDate || endDate) {
            where.dateTime = {};
            if (startDate) {
                where.dateTime.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.dateTime.lte = end;
            }
        }
        return this.prisma.booking.findMany({
            where,
            include: {
                assigned: true,
                client: true,
                event: true,
                package: {
                    include: {
                        service: true,
                        features: {
                            orderBy: { sortOrder: "asc" },
                        },
                    },
                },
            },
            orderBy: { dateTime: "desc" },
        });
    }
    findOne(id, country) {
        return this.prisma.booking.findUnique({
            where: country ? { id, country } : { id },
            include: {
                assigned: true,
                client: true,
                event: true,
                package: {
                    include: {
                        service: true,
                        features: {
                            orderBy: { sortOrder: "asc" },
                        },
                        pricing: true,
                    },
                },
            },
        });
    }
    async update(id, data, country) {
        if (country) {
            const booking = await this.prisma.booking.findFirst({
                where: { id, country },
            });
            if (!booking) {
                throw new Error("Booking not found");
            }
        }
        if (data?.dateTime && typeof data.dateTime === "string")
            data.dateTime = new Date(data.dateTime);
        return this.prisma.booking.update({ where: { id }, data });
    }
    async remove(id, country) {
        if (country) {
            const booking = await this.prisma.booking.findFirst({
                where: { id, country },
            });
            if (!booking) {
                throw new Error("Booking not found");
            }
        }
        return this.prisma.booking.delete({ where: { id } });
    }
    async assignUsers(id, userIds, country) {
        if (country) {
            const booking = await this.prisma.booking.findFirst({
                where: { id, country },
            });
            if (!booking) {
                throw new Error("Booking not found");
            }
        }
        return this.prisma.$transaction([
            this.prisma.bookingAssignment.deleteMany({ where: { bookingId: id } }),
            this.prisma.bookingAssignment.createMany({
                data: userIds.map((userId) => ({ bookingId: id, userId })),
            }),
        ]);
    }
    async getBookingMetrics(country) {
        const whereClause = country ? { country } : {};
        const [pending, approved, rejected, totalBookings, upcomingBookings] = await Promise.all([
            this.prisma.booking.count({
                where: { ...whereClause, approvalStatus: client_1.ApprovalStatus.PENDING },
            }),
            this.prisma.booking.count({
                where: { ...whereClause, approvalStatus: client_1.ApprovalStatus.APPROVED },
            }),
            this.prisma.booking.count({
                where: { ...whereClause, approvalStatus: client_1.ApprovalStatus.REJECTED },
            }),
            this.prisma.booking.count({
                where: whereClause,
            }),
            this.prisma.booking.count({
                where: {
                    ...whereClause,
                    status: client_1.BookingStatus.SCHEDULED,
                    approvalStatus: client_1.ApprovalStatus.APPROVED,
                    dateTime: { gte: new Date() },
                },
            }),
        ]);
        return {
            byApprovalStatus: {
                pending,
                approved,
                rejected,
            },
            totals: {
                total: totalBookings,
                upcoming: upcomingBookings,
            },
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map