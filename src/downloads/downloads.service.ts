import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { DeliveryStatus, PaymentStatus } from "@prisma/client";
import { randomBytes } from "crypto";
import { GoogleDriveService } from "../google-drive/google-drive.service";
import archiver from "archiver";
import { Response } from "express";

@Injectable()
export class DownloadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  /**
   * Create a new download selection (download request)
   */
  async createDownloadSelection(data: {
    eventId: string;
    photoIds: string[];
    expiresAt?: Date;
  }) {
    const token = this.generateToken();
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
      include: { client: true },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    // Set delivery status based on country
    const isUK = event.country === "UK";
    const deliveryStatus = isUK
      ? DeliveryStatus.PENDING_PAYMENT
      : DeliveryStatus.PENDING_APPROVAL;

    const downloadSelection = await this.prisma.downloadSelection.create({
      data: {
        eventId: data.eventId,
        photoIds: JSON.stringify(data.photoIds),
        token,
        expiresAt: data.expiresAt,
        photoCount: data.photoIds.length,
        deliveryStatus,
      },
    });

    return downloadSelection;
  }

  /**
   * Approve download request and send email notification
   */
  async approveDownloadRequest(
    id: string,
    approvedBy: string,
    deliverables?: string,
  ) {
    const downloadSelection = await this.prisma.downloadSelection.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!downloadSelection) {
      throw new NotFoundException("Download selection not found");
    }

    const updatedSelection = await this.prisma.downloadSelection.update({
      where: { id },
      data: {
        deliveryStatus: DeliveryStatus.PROCESSING_DELIVERY,
        approvedBy,
        approvedAt: new Date(),
        deliverables,
      },
      include: {
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    // Generate download URL
    const downloadUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/download/${updatedSelection.token}`;

    // Send email notification
    if (
      updatedSelection.event.client?.email ||
      updatedSelection.customerEmail
    ) {
      await this.emailService
        .sendDownloadReady({
          to:
            updatedSelection.event.client.email ||
            updatedSelection.customerEmail,
          clientName:
            updatedSelection.event.client.name ||
            updatedSelection.customerName ||
            "Valued Customer",
          eventName: updatedSelection.event.name,
          downloadUrl,
          expiresAt: updatedSelection.expiresAt,
          country: updatedSelection.event.country,
        })
        .catch((error) => {
          console.error("Failed to send download ready email:", error);
        });
    }

    return updatedSelection;
  }

  /**
   * Mark download as completed/shipped
   */
  async completeDownload(id: string) {
    return this.prisma.downloadSelection.update({
      where: { id },
      data: {
        deliveryStatus: DeliveryStatus.SHIPPED,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Reject download request
   */
  async rejectDownloadRequest(id: string, rejectionReason: string) {
    return this.prisma.downloadSelection.update({
      where: { id },
      data: {
        deliveryStatus: DeliveryStatus.REJECTED,
        rejectionReason,
      },
    });
  }

  /**
   * Get download selection by ID
   */
  async getById(id: string) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!selection) {
      throw new NotFoundException("Download selection not found");
    }

    return this.serializeBigInt(selection);
  }

  /**
   * Get download selection by token (for public access)
   */
  async getByToken(token: string) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { token },
      include: {
        event: {
          include: {
            // photos: true,
            client: true,
          },
        },
      },
    });

    if (!selection) {
      throw new NotFoundException("Download not found");
    }

    // Check if expired
    if (selection.expiresAt && new Date() > selection.expiresAt) {
      throw new Error("Download link has expired");
    }

    // Convert BigInt values to strings for JSON serialization
    return this.serializeBigInt(selection);
  }

  /**
   * Recursively convert BigInt values to strings for JSON serialization
   */
  private serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "bigint") {
      return obj.toString();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.serializeBigInt(item));
    }

    if (typeof obj === "object") {
      const serialized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          serialized[key] = this.serializeBigInt(obj[key]);
        }
      }
      return serialized;
    }

    return obj;
  }

  /**
   * Download selected photos as a zip file
   */
  async downloadAsZip(token: string, res: Response) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { token },
      include: {
        event: {
          include: {
            photos: true,
            client: true,
          },
        },
      },
    });

    if (!selection) {
      throw new NotFoundException("Download not found");
    }

    // Check if expired
    if (selection.expiresAt && new Date() > selection.expiresAt) {
      throw new Error("Download link has expired");
    }

    // Parse photo IDs from the stored JSON
    const rawPhotoIds: string[] = JSON.parse(selection.photoIds as string);

    // The photoIds might be stored as stringified objects, so parse them
    const photoData = rawPhotoIds.map((item) => {
      try {
        // If it's a stringified object, parse it
        if (typeof item === "string" && item.startsWith("{")) {
          const parsed = JSON.parse(item);
          return {
            id: parsed.id,
            driveFileId: parsed.googleDriveFileId || parsed.driveFileId,
          };
        }
        // Otherwise, treat it as a simple ID
        return { id: item, driveFileId: null };
      } catch {
        return { id: item, driveFileId: null };
      }
    });

    console.log("Parsed photo data:", photoData);
    console.log(
      "Available event photos:",
      selection.event.photos.map((p) => ({
        id: p.id,
        driveFileId: p.driveFileId,
      })),
    );

    // Match photos by driveFileId or id
    const photos = selection.event.photos.filter((photo) => {
      return photoData.some((data) =>
        data.driveFileId
          ? photo.driveFileId === data.driveFileId
          : photo.id === data.id,
      );
    });

    console.log("Filtered photos count:", photos.length);

    if (photos.length === 0) {
      throw new NotFoundException(
        "No photos found for this download. Please ensure the photos exist in the event.",
      );
    }

    // Filter photos that have driveFileId
    const downloadablePhotos = photos.filter((photo) => photo.driveFileId);

    if (downloadablePhotos.length === 0) {
      throw new NotFoundException(
        "No downloadable photos found. Photos must be synced from Google Drive.",
      );
    }

    // Set response headers for zip download
    const zipFilename = `${selection.event.name.replace(/[^a-z0-9]/gi, "_")}_photos.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFilename}"`,
    );

    // Create archiver instance
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Handle errors
    archive.on("error", (err) => {
      throw new Error(`Archive creation failed: ${err.message}`);
    });

    // Download and add each photo to the archive
    for (const photo of downloadablePhotos) {
      try {
        const { buffer, filename } =
          await this.googleDriveService.downloadFileAsBuffer(
            photo.driveFileId!,
          );
        archive.append(buffer, { name: filename });
      } catch (error) {
        console.error(`Failed to download photo ${photo.id}:`, error);
        // Continue with other photos even if one fails
      }
    }

    // Finalize the archive
    await archive.finalize();
  }

  /**
   * Get all download selections for an event
   */
  async getEventDownloads(eventId: string) {
    return this.prisma.downloadSelection.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update delivery format for selected photos
   */
  async updateDeliveryFormat(
    id: string,
    photoDeliveryFormats: Record<string, "digital" | "framed">,
  ) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { id },
    });

    if (!selection) {
      throw new NotFoundException("Download selection not found");
    }

    return this.prisma.downloadSelection.update({
      where: { id },
      data: {
        photoDeliveryFormats: JSON.stringify(photoDeliveryFormats),
      },
    });
  }

  /**
   * Update customer details
   */
  async updateCustomerDetails(
    id: string,
    data: {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      deliveryAddress?: string;
      additionalNotes?: string;
    },
  ) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { id },
    });

    if (!selection) {
      throw new NotFoundException("Download selection not found");
    }

    return this.prisma.downloadSelection.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        additionalNotes: data.additionalNotes,
      },
    });
  }

  /**
   * Upload payment proof (for Nigerian users)
   */
  async uploadPaymentProof(
    id: string,
    data: {
      paymentProofUrl: string;
      bankName?: string;
      transferReference?: string;
      notes?: string;
    },
  ) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            client: true,
            service: true,
          },
        },
      },
    });

    if (!selection) {
      throw new NotFoundException("Download selection not found");
    }

    const updatedSelection = await this.prisma.downloadSelection.update({
      where: { id },
      data: {
        paymentProofUrl: data.paymentProofUrl,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: "BANK_TRANSFER",
        deliveryStatus: DeliveryStatus.PENDING_APPROVAL,
        additionalNotes: data.notes
          ? `${selection.additionalNotes || ""}\nBank: ${data.bankName || "N/A"}\nRef: ${data.transferReference || "N/A"}\n${data.notes}`.trim()
          : selection.additionalNotes,
      },
      include: {
        event: {
          include: {
            client: true,
            service: true,
          },
        },
      },
    });

    // Send confirmation email to customer
    const recipientEmail =
      updatedSelection.customerEmail || updatedSelection.event.client?.email;
    const recipientName =
      updatedSelection.customerName || updatedSelection.event.client?.name;

    if (recipientEmail) {
      await this.emailService
        .sendBookingPendingApproval({
          to: recipientEmail,
          clientName: recipientName || "Valued Customer",
          serviceName:
            updatedSelection.event.service?.title ||
            updatedSelection.event.name,
          eventDate: "Your download request",
          packageName: `${updatedSelection.photoCount || 0} photos`,
          amount: 0,
          currency: "GBP",
        })
        .catch((error) => {
          console.error(
            "Failed to send payment proof confirmation email:",
            error,
          );
        });
    }

    return updatedSelection;
  }

  /**
   * Verify payment (admin action)
   */
  async verifyPayment(id: string, verifiedBy: string) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!selection) {
      throw new NotFoundException("Download selection not found");
    }

    // Check if this is a UK event - auto-approve for UK users
    const isUK = selection.event.country === "UK";

    const updatedSelection = await this.prisma.downloadSelection.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentVerifiedAt: new Date(),
        paymentVerifiedBy: verifiedBy,
        // Auto-approve for UK, manual approval for others
        deliveryStatus: isUK
          ? DeliveryStatus.PROCESSING_DELIVERY
          : DeliveryStatus.PENDING_APPROVAL,
        approvedAt: isUK ? new Date() : undefined,
        approvedBy: isUK ? verifiedBy : undefined,
      },
      include: {
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    // For UK users, automatically send download email
    if (isUK) {
      const recipientEmail =
        updatedSelection.customerEmail || updatedSelection.event.client?.email;
      const recipientName =
        updatedSelection.customerName || updatedSelection.event.client?.name;

      if (recipientEmail) {
        const downloadUrl = `${process.env.FRONTEND_URL || "http://localhost:3003"}/download/${updatedSelection.token}`;

        await this.emailService
          .sendDownloadReady({
            to: recipientEmail,
            clientName: recipientName || "Valued Customer",
            eventName: updatedSelection.event.name,
            downloadUrl,
            expiresAt: updatedSelection.expiresAt,
          })
          .catch((error) => {
            console.error("Failed to send download ready email:", error);
          });
      }
    }

    return updatedSelection;
  }

  /**
   * Create Stripe payment intent (for UK users)
   */
  async createStripePayment(
    id: string,
    data: {
      amount: number;
      currency: string;
      stripePaymentIntentId: string;
    },
  ) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { id },
    });

    if (!selection) {
      throw new NotFoundException("Download selection not found");
    }

    return this.prisma.downloadSelection.update({
      where: { id },
      data: {
        paymentAmount: data.amount,
        paymentCurrency: data.currency,
        stripePaymentIntentId: data.stripePaymentIntentId,
        paymentMethod: "STRIPE",
        paymentStatus: PaymentStatus.PENDING,
        deliveryStatus: DeliveryStatus.PENDING_APPROVAL,
      },
    });
  }

  /**
   * Confirm Stripe payment success
   */
  async confirmStripePayment(id: string) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { id },
    });

    if (!selection) {
      throw new NotFoundException("Download selection not found");
    }

    return this.prisma.downloadSelection.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        deliveryStatus: DeliveryStatus.PENDING_APPROVAL,
      },
    });
  }

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }
}
