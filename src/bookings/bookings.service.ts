import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApprovalStatus, BookingStatus, Country } from "@prisma/client";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title?: string;
    packageId: string;
    eventId?: string;
    clientId: string;
    dateTime: string | Date;
    location?: string;
    notes?: string;
    approvalStatus?: ApprovalStatus;
    status?: BookingStatus;
    country?: Country;
    assignedUserIds?: string[];
  }) {
    const { assignedUserIds, ...rest } = data;
    if (typeof rest.dateTime === "string")
      rest.dateTime = new Date(rest.dateTime);

    // Fetch package pricing for the booking country
    const packageWithPricing = await this.prisma.package.findUnique({
      where: { id: data.packageId },
      include: {
        pricing: {
          where: { country: data.country || Country.NG },
        },
      },
    });

    if (!packageWithPricing) {
      throw new Error("Package not found");
    }

    // Capture price at booking time
    const pricing = packageWithPricing.pricing[0];
    const bookingData = {
      ...rest,
      price: pricing?.price,
      currency: pricing?.currency,
    };

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: bookingData as any,
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

  findAll(country?: Country, startDate?: string, endDate?: string) {
    const where: any = country ? { country } : {};

    // Add date filtering if provided
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

  findOne(id: string, country?: Country) {
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

  async update(id: string, data: any, country?: Country) {
    // Verify ownership before updating
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

  async remove(id: string, country?: Country) {
    // Verify ownership before deleting
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

  async assignUsers(id: string, userIds: string[], country?: Country) {
    // Verify ownership before assigning
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

  async getBookingMetrics(country?: Country) {
    const whereClause = country ? { country } : {};

    // Parallel queries for all metrics
    const [pending, approved, rejected, totalBookings, upcomingBookings] =
      await Promise.all([
        this.prisma.booking.count({
          where: { ...whereClause, approvalStatus: ApprovalStatus.PENDING },
        }),
        this.prisma.booking.count({
          where: { ...whereClause, approvalStatus: ApprovalStatus.APPROVED },
        }),
        this.prisma.booking.count({
          where: { ...whereClause, approvalStatus: ApprovalStatus.REJECTED },
        }),
        this.prisma.booking.count({
          where: whereClause,
        }),
        this.prisma.booking.count({
          where: {
            ...whereClause,
            status: BookingStatus.SCHEDULED,
            approvalStatus: ApprovalStatus.APPROVED,
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
}
