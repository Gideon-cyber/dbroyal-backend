import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { ApprovalStatus, BookingStatus, Country } from "@prisma/client";
import { BookingAddOnDto } from "./dto";

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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
    addOns?: BookingAddOnDto[];
    depositAmount?: number;
  }) {
    const { assignedUserIds, addOns, ...rest } = data;
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
      throw new BadRequestException("Package not found");
    }

    // Validate and fetch add-ons pricing if provided
    let addOnsWithPricing: Array<{
      addOnId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      currency: string;
    }> = [];

    if (addOns?.length) {
      const addOnIds = addOns.map((a) => a.addOnId);
      const bookingCountry = data.country || Country.NG;

      // Validate add-ons belong to the same service as the package
      const addOnsData = await this.prisma.addOn.findMany({
        where: { id: { in: addOnIds } },
        include: {
          pricing: { where: { country: bookingCountry } },
        },
      });

      // Check all add-ons exist and belong to the same service
      const invalidAddOns = addOnsData.filter(
        (addOn) => addOn.serviceId !== packageWithPricing.serviceId,
      );
      if (invalidAddOns.length > 0) {
        throw new BadRequestException(
          `Add-ons must belong to the same service as the package: ${invalidAddOns.map((a) => a.name).join(", ")}`,
        );
      }

      const notFoundAddOnIds = addOnIds.filter(
        (id) => !addOnsData.find((a) => a.id === id),
      );
      if (notFoundAddOnIds.length > 0) {
        throw new BadRequestException(
          `Add-ons not found: ${notFoundAddOnIds.join(", ")}`,
        );
      }

      // Prepare add-ons with pricing
      addOnsWithPricing = addOns.map((addOn) => {
        const addOnData = addOnsData.find((a) => a.id === addOn.addOnId)!;
        const pricing = addOnData.pricing[0];
        if (!pricing) {
          throw new BadRequestException(
            `No pricing found for add-on "${addOnData.name}" in ${bookingCountry}`,
          );
        }

        const quantity = addOn.quantity || 1;
        const unitPrice = Number(pricing.price);

        return {
          addOnId: addOn.addOnId,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
          currency: pricing.currency,
        };
      });
    }

    // Capture price at booking time
    const pricing = packageWithPricing.pricing[0];
    const bookingData = {
      ...rest,
      price: pricing?.price,
      currency: pricing?.currency,
      paymentStatus: "UNPAID" as any,
      amountPaid: 0,
      depositAmount: data.depositAmount,
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

        // Create booking add-ons if provided
        if (addOnsWithPricing.length > 0) {
          await tx.bookingAddOn.createMany({
            data: addOnsWithPricing.map((addOn) => ({
              bookingId: newBooking.id,
              addOnId: addOn.addOnId,
              quantity: addOn.quantity,
              unitPrice: addOn.unitPrice,
              totalPrice: addOn.totalPrice,
              currency: addOn.currency,
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
            addOns: {
              include: {
                addOn: true,
              },
            },
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
      },
    );

    // Send email based on country (non-blocking, outside transaction)
    if (booking.client?.email) {
      // Prepare add-ons for email
      const emailAddOns = booking.addOns?.length
        ? booking.addOns.map((ba: any) => ({
            name: ba.addOn.name,
            quantity: ba.quantity,
            unitPrice: Number(ba.unitPrice),
            totalPrice: Number(ba.totalPrice),
          }))
        : undefined;

      const bookingWithTotals = this.calculateBookingTotals(booking);

      // Get service name from package's service
      const serviceName =
        booking.package?.service?.title ||
        booking.event?.name ||
        booking.title ||
        "Your Service";

      console.log("booking", booking);

      // Calculate deposit if applicable
      const depositAmount = booking.depositAmount
        ? Number(booking.depositAmount)
        : null;
      const isDepositBooking = depositAmount !== null && depositAmount > 0;

      // Notify admin about the new booking regardless of country
      this.emailService
        .sendAdminBookingNotification({
          clientName: booking.client.name,
          clientEmail: booking.client.email,
          serviceName,
          eventDate: booking.dateTime.toLocaleDateString(),
          packageName: booking.package.name,
          amount: Number(booking.price || 0),
          addOns: emailAddOns,
          totalAmount: bookingWithTotals.pricing.totalPrice,
          depositAmount: isDepositBooking ? depositAmount : undefined,
          currency: booking.currency,
          country: booking.country,
          notes: booking.notes,
        })
        .catch((error) => {
          console.error("Failed to send admin booking notification:", error);
        });

      // UK bookings get automatic confirmation, Nigeria bookings need approval
      if (booking.country === Country.UK) {
        this.emailService
          .sendBookingConfirmation({
            to: booking.client.email,
            clientName: booking.client.name,
            serviceName,
            eventDate: booking.dateTime.toLocaleDateString(),
            packageName: booking.package.name,
            amount: Number(booking.price || 0),
            addOns: emailAddOns,
            totalAmount: bookingWithTotals.pricing.totalPrice,
            depositAmount: isDepositBooking ? depositAmount : undefined,
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
            serviceName,
            eventDate: booking.dateTime.toLocaleDateString(),
            packageName: booking.package.name,
            amount: Number(booking.price || 0),
            addOns: emailAddOns,
            totalAmount: bookingWithTotals.pricing.totalPrice,
            depositAmount: isDepositBooking ? depositAmount : undefined,
            currency: booking.currency,
            country: booking.country,
          })
          .catch((error) => {
            console.error(
              "Failed to send booking pending approval email:",
              error,
            );
          });
      }
    }

    return this.calculateBookingTotals(booking);
  }

  async findAll(
    country?: Country,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 20,
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
          addOns: {
            include: {
              addOn: true,
            },
          },
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

    // Calculate totals for each booking
    const bookingsWithTotals = bookings.map((booking) =>
      this.calculateBookingTotals(booking),
    );

    return {
      data: bookingsWithTotals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, country?: Country) {
    const booking = await this.prisma.booking.findUnique({
      where: country ? { id, country } : { id },
      include: {
        assigned: true,
        client: true,
        event: true,
        addOns: {
          include: {
            addOn: true,
          },
        },
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

    if (!booking) return null;

    return this.calculateBookingTotals(booking);
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
        package: {
          include: {
            service: true,
          },
        },
        addOns: {
          include: {
            addOn: true,
          },
        },
      },
    });

    // Send booking accepted email if status changed to APPROVED
    if (
      data.approvalStatus === ApprovalStatus.APPROVED &&
      updatedBooking.client?.email
    ) {
      // Get service name from package's service
      const serviceName =
        updatedBooking.package?.service?.title ||
        updatedBooking.event?.name ||
        updatedBooking.title ||
        "Your Service";

      // Prepare add-ons for email
      const emailAddOns = updatedBooking.addOns?.length
        ? updatedBooking.addOns.map((ba: any) => ({
            name: ba.addOn.name,
            quantity: ba.quantity,
            unitPrice: Number(ba.unitPrice),
            totalPrice: Number(ba.totalPrice),
          }))
        : undefined;

      // Calculate totals
      const bookingWithTotals = this.calculateBookingTotals(updatedBooking);

      // Calculate deposit if applicable
      const depositAmount = updatedBooking.depositAmount
        ? Number(updatedBooking.depositAmount)
        : null;
      const isDepositBooking = depositAmount !== null && depositAmount > 0;

      this.emailService
        .sendBookingAccepted({
          to: updatedBooking.client.email,
          clientName: updatedBooking.client.name,
          serviceName,
          eventDate: updatedBooking.dateTime.toLocaleDateString(),
          packageName: updatedBooking.package?.name || "Package",
          amount: Number(updatedBooking.price || 0),
          addOns: emailAddOns,
          totalAmount: bookingWithTotals.pricing.totalPrice,
          depositAmount: isDepositBooking ? depositAmount : undefined,
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

  /**
   * Calculate total price including package price and all add-ons
   */
  private calculateBookingTotals(booking: any) {
    const packagePrice = Number(booking.price || 0);
    const addOnsTotal = (booking.addOns || []).reduce(
      (sum: number, ba: any) => sum + Number(ba.totalPrice || 0),
      0,
    );
    const totalPrice = packagePrice + addOnsTotal;

    return {
      ...booking,
      pricing: {
        packagePrice,
        addOnsTotal,
        totalPrice,
        currency: booking.currency,
      },
    };
  }
}
