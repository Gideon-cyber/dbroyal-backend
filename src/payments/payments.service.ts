import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StripeProvider } from "./providers/stripe.provider";
import { Country, PaymentMethod, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeProvider: StripeProvider
  ) {}

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

    // If approved, update booking payment status
    if (approved) {
      await this.updateBookingPaymentStatus(payment.bookingId);
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
        await this.confirmStripePayment(paymentIntent.id);
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await this.prisma.payment.updateMany({
          where: { stripePaymentIntentId: failedIntent.id },
          data: { status: PaymentStatus.FAILED },
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
