import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import {
  BookingConfirmationEmailDto,
  BookingPendingApprovalEmailDto,
  BookingAcceptedEmailDto,
  DownloadReadyEmailDto,
} from "./dto/email.dto";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {
    // Log configuration (without password) for debugging
    this.logger.log(
      `Configuring SMTP with host: ${process.env.SMTP_HOST}, port: ${process.env.SMTP_PORT}, user: ${process.env.SMTP_USER}`
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
        `SMTP connection verification failed: ${error.message}`
      );
      this.logger.error("Please check your SMTP credentials in the .env file");
    }
  }

  /**
   * Send booking confirmation email to client
   */
  async sendBookingConfirmation(
    dto: BookingConfirmationEmailDto
  ): Promise<void> {
    try {
      const {
        to,
        clientName,
        eventName,
        eventDate,
        packageName,
        amount,
        currency,
        country,
      } = dto;

      const subject = `Booking Confirmation - ${eventName}`;
      const html = this.getBookingConfirmationTemplate({
        clientName,
        eventName,
        eventDate,
        packageName,
        amount,
        currency: currency || this.getCurrencyFromCountry(country),
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
        `Failed to send booking confirmation email: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Send booking pending approval email to client (for Nigeria bookings)
   */
  async sendBookingPendingApproval(
    dto: BookingPendingApprovalEmailDto
  ): Promise<void> {
    try {
      const { to, clientName, eventName, eventDate, packageName } = dto;

      const subject = `Booking Received - ${eventName}`;
      const html = this.getBookingPendingApprovalTemplate({
        clientName,
        eventName,
        eventDate,
        packageName,
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
        `Failed to send booking pending approval email: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Send booking accepted email to client
   */
  async sendBookingAccepted(dto: BookingAcceptedEmailDto): Promise<void> {
    try {
      const { to, clientName, eventName, eventDate, additionalInfo } = dto;

      const subject = `Booking Accepted - ${eventName}`;
      const html = this.getBookingAcceptedTemplate({
        clientName,
        eventName,
        eventDate,
        additionalInfo,
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
        `Failed to send booking accepted email: ${error.message}`
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
        `Failed to send download ready email: ${error.message}`
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

    return country ? countryToCurrency[country.toUpperCase()] || "USD" : "USD";
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
    eventName: string;
    eventDate: string;
    packageName: string;
    amount: number;
    currency: string;
  }): string {
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
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Date:</strong> ${data.eventDate}</p>
                <p><strong>Package:</strong> ${data.packageName}</p>
                <p><strong>Amount:</strong> ${this.formatCurrency(data.amount, data.currency)}</p>
              </div>
              
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
    eventName: string;
    eventDate: string;
    packageName: string;
  }): string {
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
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Date:</strong> ${data.eventDate}</p>
                <p><strong>Package:</strong> ${data.packageName}</p>
              </div>
              
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
    eventName: string;
    eventDate: string;
    additionalInfo?: string;
  }): string {
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
                <h3>Event Details:</h3>
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Date:</strong> ${data.eventDate}</p>
              </div>
              
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
