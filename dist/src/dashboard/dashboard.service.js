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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardMetrics(country) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const whereClause = country ? { country } : {};
        const [totalEarnings, lastMonthEarnings, totalBookings, lastMonthBookings, pendingApprovals, teamMembers,] = await Promise.all([
            this.prisma.booking.aggregate({
                where: {
                    ...whereClause,
                    status: client_1.BookingStatus.COMPLETED,
                    createdAt: { gte: startOfMonth },
                },
                _count: true,
            }),
            this.prisma.booking.aggregate({
                where: {
                    ...whereClause,
                    status: client_1.BookingStatus.COMPLETED,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
                _count: true,
            }),
            this.prisma.booking.count({
                where: {
                    ...whereClause,
                    createdAt: { gte: startOfMonth },
                },
            }),
            this.prisma.booking.count({
                where: {
                    ...whereClause,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),
            this.prisma.booking.count({
                where: {
                    ...whereClause,
                    approvalStatus: client_1.ApprovalStatus.PENDING,
                },
            }),
            this.prisma.user.count({
                where: country ? { country } : undefined,
            }),
        ]);
        const averageBookingValue = 50000;
        const thisMonthEarnings = totalEarnings._count * averageBookingValue;
        const lastMonthEarningsValue = lastMonthEarnings._count * averageBookingValue;
        const earningsChange = lastMonthEarningsValue > 0
            ? ((thisMonthEarnings - lastMonthEarningsValue) /
                lastMonthEarningsValue) *
                100
            : 0;
        const bookingsChange = lastMonthBookings > 0
            ? ((totalBookings - lastMonthBookings) / lastMonthBookings) * 100
            : 0;
        return {
            totalEarnings: {
                value: thisMonthEarnings,
                percentageChange: Math.round(earningsChange * 10) / 10,
                trend: earningsChange >= 0 ? "up" : "down",
            },
            totalBookings: {
                value: totalBookings,
                percentageChange: Math.round(bookingsChange * 10) / 10,
                trend: bookingsChange >= 0 ? "up" : "down",
            },
            pendingApprovals: {
                value: pendingApprovals,
                status: "awaiting_review",
            },
            teamMembers: {
                value: teamMembers,
                status: "in_your_team",
            },
        };
    }
    async getRecentBookings(country, limit = 10) {
        const whereClause = country ? { country } : {};
        return this.prisma.booking.findMany({
            where: whereClause,
            include: {
                client: true,
                event: true,
                assigned: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    async getBookingsByStatus(country) {
        const whereClause = country ? { country } : {};
        const [scheduled, completed, canceled] = await Promise.all([
            this.prisma.booking.count({
                where: { ...whereClause, status: client_1.BookingStatus.SCHEDULED },
            }),
            this.prisma.booking.count({
                where: { ...whereClause, status: client_1.BookingStatus.COMPLETED },
            }),
            this.prisma.booking.count({
                where: { ...whereClause, status: client_1.BookingStatus.CANCELED },
            }),
        ]);
        return {
            scheduled,
            completed,
            canceled,
        };
    }
    async getMonthlyEarningsTrend(country, months = 6) {
        const whereClause = country ? { country } : {};
        const averageBookingValue = 50000;
        const monthlyData = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const bookings = await this.prisma.booking.count({
                where: {
                    ...whereClause,
                    status: client_1.BookingStatus.COMPLETED,
                    createdAt: { gte: monthStart, lte: monthEnd },
                },
            });
            monthlyData.push({
                month: monthStart.toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                }),
                earnings: bookings * averageBookingValue,
                bookings,
            });
        }
        return monthlyData;
    }
    async getPendingApprovals(country, limit = 10, startDate, endDate) {
        const whereClause = country ? { country } : {};
        whereClause.approvalStatus = client_1.ApprovalStatus.PENDING;
        if (startDate || endDate) {
            whereClause.dateTime = {};
            if (startDate) {
                whereClause.dateTime.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.dateTime.lte = end;
            }
        }
        const bookings = await this.prisma.booking.findMany({
            where: whereClause,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        name: true,
                        service: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
        return bookings.map((booking) => ({
            id: booking.id,
            title: booking.title || booking.event?.name,
            service: booking.event?.service?.title || "Other Services",
            serviceSlug: booking.event?.service?.slug || "other-services",
            clientName: booking.client.name,
            location: booking.location,
            dateTime: booking.dateTime,
            approvalStatus: booking.approvalStatus,
            createdAt: booking.createdAt,
        }));
    }
    async getRecentUploads(country) {
        const whereClause = country ? { country } : {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const events = await this.prisma.event.findMany({
            where: whereClause,
            include: {
                photos: {
                    where: {
                        createdAt: { gte: today },
                    },
                    include: {
                        uploadedBy: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        const recentUploads = events
            .filter((event) => event.photos.length > 0)
            .map((event) => {
            const photosByUploader = event.photos.reduce((acc, photo) => {
                const uploaderName = photo.uploadedBy?.name || "Unknown";
                if (!acc[uploaderName]) {
                    acc[uploaderName] = [];
                }
                acc[uploaderName].push(photo);
                return acc;
            }, {});
            const firstUploader = Object.keys(photosByUploader)[0];
            const totalPhotos = event.photos.length;
            const completedPhotos = event.photos.filter((p) => p.status === "COMPLETE").length;
            const pendingPhotos = totalPhotos - completedPhotos;
            return {
                id: event.id,
                service: event.service?.title || "Other Services",
                eventName: event.name,
                clientName: event.client?.name || "Unknown",
                uploadedBy: firstUploader,
                uploadDate: event.photos[0]?.createdAt,
                totalPhotos,
                completedPhotos,
                pendingPhotos,
                status: pendingPhotos > 0 ? "pending" : "complete",
            };
        });
        const totalUploadsToday = recentUploads.reduce((sum, upload) => sum + upload.totalPhotos, 0);
        return {
            totalUploadsToday,
            uploads: recentUploads,
        };
    }
    async getUpcomingBookings(country, limit = 10) {
        const whereClause = country ? { country } : {};
        const now = new Date();
        const bookings = await this.prisma.booking.findMany({
            where: {
                ...whereClause,
                status: client_1.BookingStatus.SCHEDULED,
                approvalStatus: client_1.ApprovalStatus.APPROVED,
                dateTime: { gte: now },
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        name: true,
                        service: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                            },
                        },
                    },
                },
                assigned: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                },
            },
            orderBy: { dateTime: "asc" },
            take: limit,
        });
        return bookings.map((booking) => ({
            id: booking.id,
            title: booking.title || booking.event?.name,
            service: booking.event?.service?.title || "Other Services",
            serviceSlug: booking.event?.service?.slug || "other-services",
            clientName: booking.client.name,
            dateTime: booking.dateTime,
            location: booking.location,
            assignedTo: booking.assigned.map((a) => a.user.name),
            status: booking.status,
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map