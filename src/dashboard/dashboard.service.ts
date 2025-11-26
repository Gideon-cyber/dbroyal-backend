import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApprovalStatus, BookingStatus, Country } from "@prisma/client";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(country?: Country) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    const whereClause = country ? { country } : {};

    // Parallel queries for all metrics
    const [
      totalEarnings,
      lastMonthEarnings,
      totalBookings,
      lastMonthBookings,
      pendingApprovals,
      teamMembers,
    ] = await Promise.all([
      // Total earnings this month (sum of completed bookings)
      this.prisma.booking.aggregate({
        where: {
          ...whereClause,
          status: BookingStatus.COMPLETED,
          createdAt: { gte: startOfMonth },
        },
        _count: true,
      }),
      // Last month earnings for comparison
      this.prisma.booking.aggregate({
        where: {
          ...whereClause,
          status: BookingStatus.COMPLETED,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _count: true,
      }),
      // Total bookings this month
      this.prisma.booking.count({
        where: {
          ...whereClause,
          createdAt: { gte: startOfMonth },
        },
      }),
      // Last month bookings for comparison
      this.prisma.booking.count({
        where: {
          ...whereClause,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      // Pending approvals
      this.prisma.booking.count({
        where: {
          ...whereClause,
          approvalStatus: ApprovalStatus.PENDING,
        },
      }),
      // Team members
      this.prisma.user.count({
        where: country ? { country } : undefined,
      }),
    ]);

    // Calculate earnings (assuming each booking has a standard value)
    // You can modify this to use an actual price field if added to schema
    const averageBookingValue = 50000; // Default value per booking
    const thisMonthEarnings = totalEarnings._count * averageBookingValue;
    const lastMonthEarningsValue =
      lastMonthEarnings._count * averageBookingValue;

    // Calculate percentage change
    const earningsChange =
      lastMonthEarningsValue > 0
        ? ((thisMonthEarnings - lastMonthEarningsValue) /
            lastMonthEarningsValue) *
          100
        : 0;

    const bookingsChange =
      lastMonthBookings > 0
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

  async getRecentBookings(country?: Country, limit = 10) {
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

  async getBookingsByStatus(country?: Country) {
    const whereClause = country ? { country } : {};

    const [scheduled, completed, canceled] = await Promise.all([
      this.prisma.booking.count({
        where: { ...whereClause, status: BookingStatus.SCHEDULED },
      }),
      this.prisma.booking.count({
        where: { ...whereClause, status: BookingStatus.COMPLETED },
      }),
      this.prisma.booking.count({
        where: { ...whereClause, status: BookingStatus.CANCELED },
      }),
    ]);

    return {
      scheduled,
      completed,
      canceled,
    };
  }

  async getMonthlyEarningsTrend(country?: Country, months = 6) {
    const whereClause = country ? { country } : {};
    const averageBookingValue = 50000;

    const monthlyData = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59
      );

      const bookings = await this.prisma.booking.count({
        where: {
          ...whereClause,
          status: BookingStatus.COMPLETED,
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

  async getPendingApprovals(
    country?: Country,
    limit = 10,
    startDate?: string,
    endDate?: string
  ) {
    const whereClause: any = country ? { country } : {};
    whereClause.approvalStatus = ApprovalStatus.PENDING;

    // Add date filtering if provided
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

  async getRecentUploads(country?: Country) {
    const whereClause = country ? { country } : {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get events with photos uploaded today
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

    // Filter events that have photos uploaded today and format the response
    const recentUploads = events
      .filter((event) => event.photos.length > 0)
      .map((event) => {
        const photosByUploader = event.photos.reduce(
          (acc, photo) => {
            const uploaderName = photo.uploadedBy?.name || "Unknown";
            if (!acc[uploaderName]) {
              acc[uploaderName] = [];
            }
            acc[uploaderName].push(photo);
            return acc;
          },
          {} as Record<string, typeof event.photos>
        );

        // Get the first uploader for display
        const firstUploader = Object.keys(photosByUploader)[0];
        const totalPhotos = event.photos.length;
        const completedPhotos = event.photos.filter(
          (p) => p.status === "COMPLETE"
        ).length;
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

    const totalUploadsToday = recentUploads.reduce(
      (sum, upload) => sum + upload.totalPhotos,
      0
    );

    return {
      totalUploadsToday,
      uploads: recentUploads,
    };
  }

  async getUpcomingBookings(country?: Country, limit = 10) {
    const whereClause = country ? { country } : {};
    const now = new Date();

    const bookings = await this.prisma.booking.findMany({
      where: {
        ...whereClause,
        status: BookingStatus.SCHEDULED,
        approvalStatus: ApprovalStatus.APPROVED,
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
}
