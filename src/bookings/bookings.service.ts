import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { ApprovalStatus, BookingStatus, Country } from "@prisma/client";

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

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

    // Fetch package pricing for the booking country (outside transaction)
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
      paymentStatus: "UNPAID" as any,
      amountPaid: 0,
    };

    // Optimized transaction: create booking and assignments in a single fast transaction
    // Compatible with PgBouncer transaction pooling mode
    const booking = await this.prisma.$transaction(
      async (tx) => {
        // Create booking
        const newBooking = await tx.booking.create({
          data: bookingData as any,
        });

        // Create assignments if provided
        if (assignedUserIds?.length) {
          await tx.bookingAssignment.createMany({
            data: assignedUserIds.map((userId) => ({
              bookingId: newBooking.id,
              userId,
            })),
          });
        }

        // Return booking with all relations in same transaction
        return tx.booking.findUnique({
          where: { id: newBooking.id },
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
      },
      {
        maxWait: 5000, // Wait up to 5s for transaction to start
        timeout: 10000, // Transaction must complete within 10s
      }
    );

    // Send email based on country (non-blocking, outside transaction)
    if (booking.client?.email) {
      // UK bookings get automatic confirmation, Nigeria bookings need approval
      if (booking.country === Country.UK) {
        this.emailService
          .sendBookingConfirmation({
            to: booking.client.email,
            clientName: booking.client.name,
            eventName: booking.event?.name || booking.title || "Your Event",
            eventDate: booking.dateTime.toLocaleDateString(),
            packageName: booking.package.name,
            amount: Number(booking.price || 0),
            currency: booking.currency,
            country: booking.country,
          })
          .catch((error) => {
            console.error("Failed to send booking confirmation email:", error);
          });
      } else if (booking.country === Country.NG) {
        this.emailService
          .sendBookingPendingApproval({
            to: booking.client.email,
            clientName: booking.client.name,
            eventName: booking.event?.name || booking.title || "Your Event",
            eventDate: booking.dateTime.toLocaleDateString(),
            packageName: booking.package.name,
            currency: booking.currency,
            country: booking.country,
          })
          .catch((error) => {
            console.error(
              "Failed to send booking pending approval email:",
              error
            );
          });
      }
    }

    return booking;
  }

  async findAll(
    country?: Country,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 20
  ) {
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

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data,
      include: {
        client: true,
        event: true,
        package: true,
      },
    });

    // Send booking accepted email if status changed to APPROVED
    if (
      data.approvalStatus === ApprovalStatus.APPROVED &&
      updatedBooking.client?.email
    ) {
      this.emailService
        .sendBookingAccepted({
          to: updatedBooking.client.email,
          clientName: updatedBooking.client.name,
          eventName:
            updatedBooking.event?.name || updatedBooking.title || "Your Event",
          eventDate: updatedBooking.dateTime.toLocaleDateString(),
          additionalInfo: data.notes || updatedBooking.notes,
          currency: updatedBooking.currency,
          country: updatedBooking.country,
        })
        .catch((error) => {
          console.error("Failed to send booking accepted email:", error);
        });
    }

    return updatedBooking;
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
