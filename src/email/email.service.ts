import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import {
  BookingConfirmationEmailDto,
  BookingPendingApprovalEmailDto,
  BookingAcceptedEmailDto,
  DownloadReadyEmailDto,
  AdminBookingNotificationDto,
} from "./dto/email.dto";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {
    // Log configuration (without password) for debugging
    this.logger.log(
      `Configuring SMTP with host: ${process.env.SMTP_HOST}, port: ${process.env.SMTP_PORT}, user: ${process.env.SMTP_USER}`,
    );

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.titan.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // false for TLS, true for SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Add these options for better compatibility with Titan
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      // Enable debug mode
      debug: true,
      logger: true,
    });

    // Verify connection on startup
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log("SMTP connection verified successfully");
    } catch (error) {
      this.logger.error(
        `SMTP connection verification failed: ${error.message}`,
      );
      this.logger.error("Please check your SMTP credentials in the .env file");
    }
  }

  /**
   * Send booking confirmation email to client
   */
  async sendBookingConfirmation(
    dto: BookingConfirmationEmailDto,
  ): Promise<void> {
    try {
      const {
        to,
        clientName,
        serviceName,
        eventDate,
        packageName,
        amount,
        addOns,
        totalAmount,
        currency,
        country,
        depositAmount,
      } = dto;

      const subject = `Booking Confirmation - ${serviceName}`;
      const html = this.getBookingConfirmationTemplate({
        clientName,
        serviceName,
        eventDate,
        packageName,
        amount,
        addOns,
        totalAmount,
        currency: currency || this.getCurrencyFromCountry(country),
        depositAmount,
      });

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      this.logger.log(`Booking confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Send booking pending approval email to client (for Nigeria bookings)
   */
  async sendBookingPendingApproval(
    dto: BookingPendingApprovalEmailDto,
  ): Promise<void> {
    try {
      const {
        to,
        clientName,
        serviceName,
        eventDate,
        packageName,
        amount,
        addOns,
        totalAmount,
        currency,
        country,
      } = dto;

      const subject = `Booking Received - ${serviceName}`;
      const html = this.getBookingPendingApprovalTemplate({
        clientName,
        serviceName,
        eventDate,
        packageName,
        amount,
        addOns,
        totalAmount,
        currency: currency || this.getCurrencyFromCountry(country),
      });

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      this.logger.log(`Booking pending approval email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking pending approval email: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Send booking accepted email to client
   */
  async sendBookingAccepted(dto: BookingAcceptedEmailDto): Promise<void> {
    try {
      const {
        to,
        clientName,
        serviceName,
        eventDate,
        packageName,
        amount,
        addOns,
        totalAmount,
        additionalInfo,
        currency,
        country,
        depositAmount,
      } = dto;

      const subject = `Booking Accepted - ${serviceName}`;
      const html = this.getBookingAcceptedTemplate({
        clientName,
        serviceName,
        eventDate,
        packageName,
        amount,
        addOns,
        totalAmount,
        additionalInfo,
        depositAmount,
        currency: currency || this.getCurrencyFromCountry(country),
      });

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      this.logger.log(`Booking accepted email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking accepted email: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Send new booking notification email to admin
   */
  async sendAdminBookingNotification(
    dto: AdminBookingNotificationDto,
  ): Promise<void> {
    const adminEmail = process.env.SMTP_FROM;
    if (!adminEmail) {
      this.logger.warn(
        "ADMIN_EMAIL not set — skipping admin booking notification",
      );
      return;
    }

    try {
      const subject = `New Booking Request - ${dto.serviceName} (${dto.country || "Unknown"})}`;
      const html = this.getAdminBookingNotificationTemplate(dto);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        subject,
        html,
      });

      this.logger.log(`Admin booking notification sent to ${adminEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send admin booking notification: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Send download ready notification email to client
   */
  async sendDownloadReady(dto: DownloadReadyEmailDto): Promise<void> {
    try {
      const { to, clientName, eventName, downloadUrl, expiresAt } = dto;

      const subject = `Your Photos Are Ready - ${eventName}`;
      const html = this.getDownloadReadyTemplate({
        clientName,
        eventName,
        downloadUrl,
        expiresAt,
      });

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      this.logger.log(`Download ready email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send download ready email: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get currency from country code
   */
  private getCurrencyFromCountry(country?: string): string {
    const countryToCurrency: { [key: string]: string } = {
      NG: "NGN",
      UK: "GBP",
      US: "USD",
      GB: "GBP",
      EU: "EUR",
    };

    return country ? countryToCurrency[country.toUpperCase()] || "GBP" : "GBP";
  }

  /**
   * Format currency based on currency code
   */
  private formatCurrency(amount: number, currency: string): string {
    const currencySymbols: { [key: string]: string } = {
      NGN: "₦",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      INR: "₹",
      AUD: "A$",
      CAD: "C$",
      CHF: "CHF",
      CNY: "¥",
      SEK: "kr",
      NZD: "NZ$",
      MXN: "Mex$",
      SGD: "S$",
      HKD: "HK$",
      NOK: "kr",
      KRW: "₩",
      TRY: "₺",
      RUB: "₽",
      BRL: "R$",
      ZAR: "R",
    };

    const symbol = currencySymbols[currency.toUpperCase()] || currency;
    const formattedAmount = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // For currencies typically shown after the amount
    if (["SEK", "NOK", "DKK"].includes(currency.toUpperCase())) {
      return `${formattedAmount} ${symbol}`;
    }

    return `${symbol}${formattedAmount}`;
  }

  /**
   * Template for booking confirmation email
   */
  private getBookingConfirmationTemplate(data: {
    clientName: string;
    serviceName: string;
    eventDate: string;
    packageName: string;
    amount: number;
    currency: string;
    addOns?: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount?: number;
    depositAmount?: number;
  }): string {
    const addOnsHtml = data.addOns?.length
      ? `
        <div style="margin-top: 15px;">
          <h4 style="margin-bottom: 10px;">Add-ons:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${data.addOns
              .map(
                (addOn) => `
              <tr>
                <td style="padding: 5px 0;">${addOn.name} ${addOn.quantity > 1 ? `(x${addOn.quantity})` : ""}</td>
                <td style="padding: 5px 0; text-align: right;">${this.formatCurrency(addOn.totalPrice, data.currency)}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </div>
      `
      : "";

    const totalHtml =
      data.totalAmount && data.totalAmount !== data.amount
        ? `<p style="margin-top: 15px; font-size: 18px;"><strong>Total:</strong> ${this.formatCurrency(data.totalAmount, data.currency)}</p>`
        : "";

    const depositHtml = data.depositAmount
      ? `
        <div style="background-color: #E8F5E9; padding: 15px; border-radius: 4px; margin: 15px 0; border: 2px solid #4CAF50;">
          <h4 style="margin-top: 0; color: #2E7D32;">💰 Payment Information</h4>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Deposit Required:</strong> ${this.formatCurrency(data.depositAmount, data.currency)}</p>
          ${data.totalAmount ? `<p style="margin: 5px 0; color: #666;">Full Amount: ${this.formatCurrency(data.totalAmount, data.currency)}</p>` : ""}
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #555;">A 50% deposit is required to secure your booking. The remaining balance will be due before the event.</p>
        </div>
      `
      : totalHtml;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${data.clientName},</p>
              <p>Thank you for choosing us! Your booking has been confirmed.</p>
              
              <div class="details">
                <h3>Booking Details:</h3>
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Date:</strong> ${data.eventDate}</p>
                <p><strong>Package:</strong> ${data.packageName} - ${this.formatCurrency(data.amount, data.currency)}</p>
                ${addOnsHtml}
              </div>
              ${depositHtml}
              
              <p>We're excited to capture your special moments! Our team will be in touch with you shortly to discuss the details.</p>
              <p>If you have any questions, please don't hesitate to reach out to us.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DB Royal Photography. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Template for booking pending approval email (Nigeria bookings)
   */
  private getBookingPendingApprovalTemplate(data: {
    clientName: string;
    serviceName: string;
    eventDate: string;
    packageName: string;
    amount: number;
    currency: string;
    addOns?: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount?: number;
    depositAmount?: number;
  }): string {
    const addOnsHtml = data.addOns?.length
      ? `
        <div style="margin-top: 15px;">
          <h4 style="margin-bottom: 10px;">Add-ons:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${data.addOns
              .map(
                (addOn) => `
              <tr>
                <td style="padding: 5px 0;">${addOn.name} ${addOn.quantity > 1 ? `(x${addOn.quantity})` : ""}</td>
                <td style="padding: 5px 0; text-align: right;">${this.formatCurrency(addOn.totalPrice, data.currency)}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </div>
      `
      : "";

    const totalHtml =
      data.totalAmount && data.totalAmount !== data.amount
        ? `<p style="margin-top: 15px; font-size: 18px;"><strong>Total:</strong> ${this.formatCurrency(data.totalAmount, data.currency)}</p>`
        : "";

    const depositHtml = data.depositAmount
      ? `
        <div style="background-color: #FFF8E1; padding: 15px; border-radius: 4px; margin: 15px 0; border: 2px solid #FF9800;">
          <h4 style="margin-top: 0; color: #E65100;">💰 Payment Information</h4>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Deposit Required:</strong> ${this.formatCurrency(data.depositAmount, data.currency)}</p>
          ${data.totalAmount ? `<p style="margin: 5px 0; color: #666;">Full Amount: ${this.formatCurrency(data.totalAmount, data.currency)}</p>` : ""}
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #555;">A 50% deposit is required to secure your booking. Payment details will be shared once your booking is approved.</p>
        </div>
      `
      : totalHtml;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            .info-box { background-color: #FFF3E0; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #FFE0B2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Received</h1>
            </div>
            <div class="content">
              <p>Dear ${data.clientName},</p>
              <p>Thank you for your booking request! We have received your booking details and our team is currently reviewing it.</p>
              
              <div class="details">
                <h3>Booking Details:</h3>
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Date:</strong> ${data.eventDate}</p>
                <p><strong>Package:</strong> ${data.packageName} - ${this.formatCurrency(data.amount, data.currency)}</p>
                ${addOnsHtml}
              </div>
              ${depositHtml}
              
              <div class="info-box">
                <h4>⏳ What happens next?</h4>
                <p>Your booking is currently <strong>pending approval</strong>. Our team will review your request and get back to you shortly.</p>
                <p>You will receive a confirmation email once your booking has been approved.</p>
              </div>
              
              <p>If you have any questions or need to provide additional information, please don't hesitate to reach out to us.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DB Royal Photography. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Template for booking accepted email
   */
  private getBookingAcceptedTemplate(data: {
    clientName: string;
    serviceName: string;
    eventDate: string;
    packageName: string;
    amount: number;
    currency: string;
    addOns?: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount?: number;
    depositAmount?: number;
    additionalInfo?: string;
  }): string {
    const addOnsHtml = data.addOns?.length
      ? `
        <div style="margin-top: 15px;">
          <h4 style="margin-bottom: 10px;">Add-ons:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${data.addOns
              .map(
                (addOn) => `
              <tr>
                <td style="padding: 5px 0;">${addOn.name} ${addOn.quantity > 1 ? `(x${addOn.quantity})` : ""}</td>
                <td style="padding: 5px 0; text-align: right;">${this.formatCurrency(addOn.totalPrice, data.currency)}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </div>
      `
      : "";

    const totalHtml =
      data.totalAmount && data.totalAmount !== data.amount
        ? `<p style="margin-top: 15px; font-size: 18px;"><strong>Total:</strong> ${this.formatCurrency(data.totalAmount, data.currency)}</p>`
        : "";

    const depositHtml = data.depositAmount
      ? `
        <div style="background-color: #E3F2FD; padding: 15px; border-radius: 4px; margin: 15px 0; border: 2px solid #2196F3;">
          <h4 style="margin-top: 0; color: #1565C0;">💰 Payment Information</h4>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Deposit Required:</strong> ${this.formatCurrency(data.depositAmount, data.currency)}</p>
          ${data.totalAmount ? `<p style="margin: 5px 0; color: #666;">Full Amount: ${this.formatCurrency(data.totalAmount, data.currency)}</p>` : ""}
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #555;">Please pay the 50% deposit to finalize your booking. The remaining balance will be due before the event.</p>
        </div>
      `
      : totalHtml;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            .highlight { background-color: #E3F2FD; padding: 15px; border-radius: 4px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Accepted! 🎉</h1>
            </div>
            <div class="content">
              <p>Dear ${data.clientName},</p>
              <p>Great news! Your booking has been officially accepted and confirmed.</p>
              
              <div class="details">
                <h3>Booking Details:</h3>
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Date:</strong> ${data.eventDate}</p>
                <p><strong>Package:</strong> ${data.packageName} - ${this.formatCurrency(data.amount, data.currency)}</p>
                ${addOnsHtml}
              </div>
              ${depositHtml}
              
              ${
                data.additionalInfo
                  ? `
                <div class="highlight">
                  <h4>Additional Information:</h4>
                  <p>${data.additionalInfo}</p>
                </div>
              `
                  : ""
              }
              
              <p>We're all set for your event! Our team is prepared and excited to capture your special moments.</p>
              <p>Please ensure you've reviewed all the details. If you have any last-minute changes or questions, feel free to contact us.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DB Royal Photography. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Template for admin new booking notification
   */
  private getAdminBookingNotificationTemplate(
    data: AdminBookingNotificationDto,
  ): string {
    const currencyCode =
      data.currency || this.getCurrencyFromCountry(data.country);

    const addOnsHtml = data.addOns?.length
      ? `
        <div style="margin-top: 15px;">
          <h4 style="margin-bottom: 10px;">Add-ons:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${data.addOns
              .map(
                (addOn) => `
              <tr>
                <td style="padding: 5px 0;">${addOn.name} ${addOn.quantity > 1 ? `(x${addOn.quantity})` : ""}</td>
                <td style="padding: 5px 0; text-align: right;">${this.formatCurrency(addOn.totalPrice, currencyCode)}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </div>
      `
      : "";

    const totalHtml =
      data.totalAmount && data.totalAmount !== data.amount
        ? `<p style="margin-top: 10px; font-size: 16px;"><strong>Total:</strong> ${this.formatCurrency(data.totalAmount, currencyCode)}</p>`
        : "";

    const depositHtml = data.depositAmount
      ? `<p style="margin: 5px 0;"><strong>Deposit:</strong> ${this.formatCurrency(data.depositAmount, currencyCode)}</p>`
      : "";

    const notesHtml = data.notes
      ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${data.notes}</p>`
      : "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #673AB7; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #673AB7; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .badge-ng { background-color: #FFF3CD; color: #856404; }
            .badge-uk { background-color: #D1ECF1; color: #0C5460; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Booking Request</h1>
            </div>
            <div class="content">
              <p>A new booking request has been submitted. Review the details below.</p>

              <div class="details">
                <h3>Client Details:</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${data.clientName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${data.clientEmail}">${data.clientEmail}</a></p>

                <h3 style="margin-top: 15px;">Booking Details:</h3>
                <p style="margin: 5px 0;"><strong>Service:</strong> ${data.serviceName}</p>
                <p style="margin: 5px 0;"><strong>Package:</strong> ${data.packageName} — ${this.formatCurrency(data.amount, currencyCode)}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${data.eventDate}</p>
                <p style="margin: 5px 0;"><strong>Country:</strong> ${data.country || "N/A"}</p>
                ${addOnsHtml}
                ${totalHtml}
                ${depositHtml}
                ${notesHtml}
              </div>

              <p style="margin-top: 20px;">Please log in to the admin dashboard to review and manage this booking.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DB Royal Photography. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Template for download ready email
   */
  private getDownloadReadyTemplate(data: {
    clientName: string;
    eventName: string;
    downloadUrl: string;
    expiresAt?: Date;
  }): string {
    const expirationText = data.expiresAt
      ? `This link will expire on ${new Date(data.expiresAt).toLocaleDateString()}.`
      : "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .warning { background-color: #FFF3E0; padding: 10px; border-radius: 4px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Photos Are Ready! 📸</h1>
            </div>
            <div class="content">
              <p>Dear ${data.clientName},</p>
              <p>Exciting news! Your photos from <strong>${data.eventName}</strong> are now ready for download.</p>
              
              <div class="details">
                <h3>Download Your Photos:</h3>
                <p>Click the button below to access your photos:</p>
                <a href="${data.downloadUrl}" class="button">Download Photos</a>
                <p style="margin-top: 15px; font-size: 12px; color: #666;">
                  Or copy this link: <br/>
                  <code style="background: #f0f0f0; padding: 5px; display: inline-block; margin-top: 5px;">${data.downloadUrl}</code>
                </p>
              </div>
              
              ${
                expirationText
                  ? `
                <div class="warning">
                  <p><strong>⏰ Important:</strong> ${expirationText}</p>
                </div>
              `
                  : ""
              }
              
              <p>We hope you love your photos as much as we enjoyed capturing them!</p>
              <p>If you have any issues with the download or have any questions, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DB Royal Photography. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
