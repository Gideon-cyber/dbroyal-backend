import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StripeProvider } from "./providers/stripe.provider";
import { EmailService } from "../email/email.service";
import { Country, PaymentMethod, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeProvider: StripeProvider,
    private readonly emailService: EmailService
  ) {}

  /**
   * Create a Stripe payment intent for downloads
   */
  async createDownloadPayment(
    downloadId: string,
    amount: number,
    currency: string,
    description?: string,
    paidBy?: string
  ) {
    // Verify download exists
    const download = await this.prisma.downloadSelection.findUnique({
      where: { id: downloadId },
      include: { event: { include: { client: true } } },
    });

    if (!download) {
      throw new NotFoundException("Download request not found");
    }

    // Check if download is in correct status
    if (download.deliveryStatus !== "PENDING_PAYMENT") {
      throw new BadRequestException(
        "Download request must be in PENDING_PAYMENT status"
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await this.stripeProvider.createPaymentIntent(
      amount,
      currency,
      {
        bookingId: download.id, // Using bookingId field for compatibility
        clientId: download.event.clientId || "",
        description:
          description ||
          `Payment for ${download.photoCount} photos download - Event ${download.event.name || "Download"}`,
      }
    );

    // Update download record with payment info
    await this.prisma.downloadSelection.update({
      where: { id: downloadId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        paymentAmount: amount / 100, // Convert from pence to pounds
        paymentCurrency: currency.toUpperCase(),
        paymentMethod: PaymentMethod.STRIPE,
        paymentStatus: PaymentStatus.PENDING,
        customerName: paidBy || download.customerName,
      },
    });

    return {
      downloadId: download.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount / 100,
      currency: currency.toUpperCase(),
    };
  }

  /**
   * Confirm Stripe payment for download after client completes it
   */
  async confirmDownloadPayment(paymentIntentId: string, userId?: string) {
    // Find download by payment intent ID
    const download = await this.prisma.downloadSelection.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!download) {
      throw new NotFoundException("Download request not found");
    }

    // Retrieve payment intent from Stripe
    const paymentIntent =
      await this.stripeProvider.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Check if this is a UK event - auto-approve for UK users
      const isUK = download.event.country === Country.UK;

      // Update download payment status
      const updatedDownload = await this.prisma.downloadSelection.update({
        where: { id: download.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentVerifiedAt: new Date(),
          paymentVerifiedBy: userId,
          // Auto-approve for UK, manual approval for others
          deliveryStatus: isUK ? "PROCESSING_DELIVERY" : "PENDING_APPROVAL",
          approvedAt: isUK ? new Date() : undefined,
          approvedBy: isUK ? userId || "system" : undefined,
        },
      });

      // For UK users, automatically send download email
      if (isUK) {
        await this.sendDownloadReadyEmail(download.id);
      }

      return updatedDownload;
    } else if (paymentIntent.status === "canceled") {
      await this.prisma.downloadSelection.update({
        where: { id: download.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      throw new BadRequestException("Payment was canceled");
    } else {
      throw new BadRequestException(
        `Payment status is ${paymentIntent.status}, not succeeded`
      );
    }
  }

  /**
   * Get download payment details
   */
  async getDownloadPayment(downloadId: string) {
    const download = await this.prisma.downloadSelection.findUnique({
      where: { id: downloadId },
      include: {
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!download) {
      throw new NotFoundException("Download request not found");
    }

    return {
      id: download.id,
      eventId: download.eventId,
      eventTitle: download.event.name,
      photoCount: download.photoCount,
      customerName: download.customerName,
      customerEmail: download.customerEmail,
      paymentStatus: download.paymentStatus,
      paymentAmount: download.paymentAmount
        ? Number(download.paymentAmount)
        : 0,
      paymentCurrency: download.paymentCurrency,
      paymentMethod: download.paymentMethod,
      stripePaymentIntentId: download.stripePaymentIntentId,
      paymentVerifiedAt: download.paymentVerifiedAt,
      deliveryStatus: download.deliveryStatus,
      createdAt: download.createdAt,
      updatedAt: download.updatedAt,
    };
  }

  /**
   * Get bank account details for Nigeria payments
   */
  getBankAccountDetails(country: Country) {
    if (country !== Country.NG) {
      throw new BadRequestException(
        "Bank transfer is only available for Nigeria"
      );
    }

    return {
      country: "Nigeria",
      currency: "NGN",
      accounts: [
        {
          bankName: process.env.NG_BANK_NAME || "GTBank",
          accountNumber: process.env.NG_ACCOUNT_NUMBER || "0123456789",
          accountName: process.env.NG_ACCOUNT_NAME || "DBRoyal Photography Ltd",
        },
      ],
      instructions: [
        "Make a bank transfer to the account above",
        "Take a clear screenshot of the transfer confirmation",
        "Upload the screenshot when submitting your payment proof",
        "Your payment will be verified by our team within 24 hours",
      ],
    };
  }

  /**
   * Create a Stripe payment intent for UK bookings
   */
  async createStripePayment(
    bookingId: string,
    amount: number,
    currency: string,
    description?: string,
    paidBy?: string
  ) {
    // Verify booking exists and is for UK
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, package: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.country !== Country.UK) {
      throw new BadRequestException(
        "Stripe payments are only available for UK bookings"
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await this.stripeProvider.createPaymentIntent(
      amount,
      currency,
      {
        bookingId: booking.id,
        clientId: booking.clientId,
        description:
          description ||
          `Payment for ${booking.package.name} - ${booking.title || "Booking"}`,
      }
    );

    // Create payment record in database
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        amount: amount / 100, // Convert from pence to pounds
        currency: currency.toUpperCase(),
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        paidBy: paidBy || booking.client.name,
      },
    });

    return {
      payment,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Confirm Stripe payment after client completes it
   */
  async confirmStripePayment(paymentIntentId: string, userId?: string) {
    // Retrieve payment from database
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    // Retrieve payment intent from Stripe
    const paymentIntent =
      await this.stripeProvider.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Check if this is a UK booking - auto-approve for UK users
      const isUK = payment.booking.country === Country.UK;

      // Update payment status
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          stripeChargeId: paymentIntent.latest_charge as string,
          verifiedAt: new Date(),
          verifiedBy: userId,
        },
      });

      // Update booking payment status
      await this.updateBookingPaymentStatus(payment.bookingId);

      // For UK bookings, automatically approve the booking
      if (isUK) {
        await this.prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            approvalStatus: "APPROVED",
          },
        });
      }

      // Send booking accepted email to client
      await this.sendBookingAcceptedEmail(payment.bookingId);

      return updatedPayment;
    } else if (paymentIntent.status === "canceled") {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw new BadRequestException("Payment was canceled");
    } else {
      throw new BadRequestException(
        `Payment status is ${paymentIntent.status}, not succeeded`
      );
    }
  }

  /**
   * Create a bank transfer payment record (Nigeria)
   */
  async createBankTransferPayment(
    bookingId: string,
    data: {
      amount: number;
      paymentProofUrl: string;
      bankName?: string;
      accountNumber?: string;
      transferReference?: string;
      paidBy?: string;
      notes?: string;
    }
  ) {
    // Verify booking exists and is for Nigeria
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.country !== Country.NG) {
      throw new BadRequestException(
        "Bank transfer is only available for Nigeria bookings"
      );
    }

    // Create payment record with PENDING status (awaiting admin verification)
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        amount: data.amount,
        currency: "NGN",
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.PENDING,
        paymentProofUrl: data.paymentProofUrl,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        transferReference: data.transferReference,
        paidBy: data.paidBy || booking.client.name,
        notes: data.notes,
      },
    });

    return payment;
  }

  /**
   * Admin verifies a bank transfer payment
   */
  async verifyBankTransferPayment(
    paymentId: string,
    approved: boolean,
    adminUserId: string,
    notes?: string
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.method !== PaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException(
        "Only bank transfer payments require manual verification"
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        `Payment status is ${payment.status}, cannot verify`
      );
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: approved ? PaymentStatus.PAID : PaymentStatus.FAILED,
        verifiedBy: adminUserId,
        verifiedAt: new Date(),
        notes: notes || payment.notes,
      },
    });

    // If approved, update booking payment status and send email
    if (approved) {
      await this.updateBookingPaymentStatus(payment.bookingId);

      // For UK bookings, automatically approve the booking
      const isUK = payment.booking.country === Country.UK;
      if (isUK) {
        await this.prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            approvalStatus: "APPROVED",
          },
        });
      }

      // Send booking accepted email to client
      await this.sendBookingAcceptedEmail(payment.bookingId);
    }

    return updatedPayment;
  }

  /**
   * Get all payments for a booking
   */
  async getBookingPayments(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get a specific payment
   */
  async getPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            client: true,
            package: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return payment;
  }

  /**
   * Get all pending payments (for admin)
   */
  async getPendingPayments(country?: Country) {
    const where: any = {
      status: PaymentStatus.PENDING,
      method: PaymentMethod.BANK_TRANSFER, // Only bank transfers need verification
    };

    if (country) {
      where.booking = { country };
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            client: true,
            package: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Calculate booking balance
   */
  async calculateBookingBalance(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: {
            status: PaymentStatus.PAID,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const totalPrice = booking.price ? Number(booking.price) : 0;
    const amountPaid = Number(booking.amountPaid);
    const balance = totalPrice - amountPaid;

    return {
      totalPrice,
      amountPaid,
      balance,
      currency: booking.currency,
      paymentStatus: booking.paymentStatus,
      depositAmount: booking.depositAmount ? Number(booking.depositAmount) : 0,
      depositPaid: booking.depositPaid,
      payments: booking.payments,
    };
  }

  /**
   * Send booking accepted email to client
   */
  private async sendBookingAcceptedEmail(bookingId: string): Promise<void> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          client: true,
          package: true,
        },
      });

      if (!booking) {
        this.logger.warn(
          `Booking ${bookingId} not found for email notification`
        );
        return;
      }

      if (!booking.client?.email) {
        this.logger.warn(`No email found for client of booking ${bookingId}`);
        return;
      }

      await this.emailService.sendBookingAccepted({
        to: booking.client.email,
        clientName: booking.client.name,
        eventName: booking.title || booking.package.name,
        eventDate: booking.dateTime
          ? new Date(booking.dateTime).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "To be confirmed",
        additionalInfo:
          "Your payment has been confirmed and your booking is now active. We look forward to capturing your special moments!",
      });

      this.logger.log(
        `Booking accepted email sent to ${booking.client.email} for booking ${bookingId}`
      );
    } catch (error) {
      // Log error but don't throw - email failure shouldn't break payment flow
      this.logger.error(
        `Failed to send booking accepted email for booking ${bookingId}: ${error.message}`
      );
    }
  }

  /**
   * Send download ready email to client
   */
  private async sendDownloadReadyEmail(downloadId: string): Promise<void> {
    try {
      const download = await this.prisma.downloadSelection.findUnique({
        where: { id: downloadId },
        include: {
          event: {
            include: {
              client: true,
            },
          },
        },
      });

      if (!download) {
        this.logger.warn(
          `Download ${downloadId} not found for email notification`
        );
        return;
      }

      // Check if we have customer email or event client email
      const recipientEmail =
        download.customerEmail || download.event.client?.email;
      const recipientName =
        download.customerName || download.event.client?.name;

      if (!recipientEmail) {
        this.logger.warn(`No email found for download ${downloadId}`);
        return;
      }

      // Generate download URL
      const downloadUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/download/${download.token}`;

      await this.emailService.sendDownloadReady({
        to: recipientEmail,
        clientName: recipientName || "Valued Customer",
        eventName: download.event.name,
        downloadUrl,
        expiresAt: download.expiresAt,
      });

      this.logger.log(
        `Download ready email sent to ${recipientEmail} for download ${downloadId}`
      );
    } catch (error) {
      // Log error but don't throw - email failure shouldn't break payment flow
      this.logger.error(
        `Failed to send download ready email for download ${downloadId}: ${error.message}`
      );
    }
  }

  /**
   * Update booking payment status based on payments
   */
  private async updateBookingPaymentStatus(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: { status: PaymentStatus.PAID },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Calculate total paid amount
    const totalPaid = booking.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const totalPrice = booking.price ? Number(booking.price) : 0;
    const depositAmount = booking.depositAmount
      ? Number(booking.depositAmount)
      : 0;

    let paymentStatus: PaymentStatus;
    let depositPaid = false;

    if (totalPaid === 0) {
      paymentStatus = PaymentStatus.UNPAID;
    } else if (totalPaid >= totalPrice) {
      paymentStatus = PaymentStatus.PAID;
      depositPaid = true;
    } else {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
      if (depositAmount > 0 && totalPaid >= depositAmount) {
        depositPaid = true;
      }
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        amountPaid: totalPaid,
        paymentStatus,
        depositPaid,
      },
    });
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Check if it's a booking or download payment
        const bookingPayment = await this.prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
        });
        if (bookingPayment) {
          await this.confirmStripePayment(paymentIntent.id);
        } else {
          // Try download payment
          const downloadPayment = await this.prisma.downloadSelection.findFirst(
            {
              where: { stripePaymentIntentId: paymentIntent.id },
            }
          );
          if (downloadPayment) {
            await this.confirmDownloadPayment(paymentIntent.id);
          }
        }
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        // Handle failed booking payments
        await this.prisma.payment.updateMany({
          where: { stripePaymentIntentId: failedIntent.id },
          data: { status: PaymentStatus.FAILED },
        });
        // Handle failed download payments
        await this.prisma.downloadSelection.updateMany({
          where: { stripePaymentIntentId: failedIntent.id },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
        break;

      case "charge.refunded":
        const charge = event.data.object as Stripe.Charge;
        const payment = await this.prisma.payment.findFirst({
          where: { stripeChargeId: charge.id },
        });
        if (payment) {
          const refundAmount = charge.amount_refunded / 100;
          const originalAmount = Number(payment.amount);

          const newStatus =
            refundAmount >= originalAmount
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PARTIALLY_REFUNDED;

          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: newStatus },
          });

          await this.updateBookingPaymentStatus(payment.bookingId);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Create a refund for a payment
   */
  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string,
    adminUserId?: string
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException("Can only refund paid payments");
    }

    if (payment.method === PaymentMethod.STRIPE) {
      if (!payment.stripePaymentIntentId) {
        throw new BadRequestException("No Stripe payment intent found");
      }

      // Convert amount to pence if specified
      const refundAmount = amount ? Math.round(amount * 100) : undefined;

      // Create refund in Stripe
      await this.stripeProvider.createRefund(
        payment.stripePaymentIntentId,
        refundAmount,
        reason
      );

      // Update will happen via webhook
      return { message: "Refund initiated, will be processed by Stripe" };
    } else {
      // Manual refund for bank transfers
      const refundAmount = amount || Number(payment.amount);
      const originalAmount = Number(payment.amount);

      const newStatus =
        refundAmount >= originalAmount
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED;

      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          notes: `${payment.notes || ""}\nRefund: ${refundAmount} ${payment.currency}. Reason: ${reason || "N/A"}`,
          verifiedBy: adminUserId,
        },
      });

      await this.updateBookingPaymentStatus(payment.bookingId);

      return updatedPayment;
    }
  }
}
