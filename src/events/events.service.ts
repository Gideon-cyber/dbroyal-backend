import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Country } from "@prisma/client";
import { GoogleDriveService } from "../google-drive/google-drive.service";
import { randomUUID } from "crypto";

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDriveService: GoogleDriveService
  ) {}

  async create(data: {
    name: string;
    slug?: string;
    serviceId: string;
    description?: string;
    date?: string | Date;
    location?: string;
    coverImageUrl?: string;
    googleDriveUrl?: string;
    clientId?: string;
    country?: Country;
  }) {
    if (typeof data.date === "string") data.date = new Date(data.date);

    // Generate slug from name if not provided
    const slug = data.slug || this.generateSlug(data.name);

    // Extract and store folder ID if Google Drive URL is provided
    const driveFolderId = data.googleDriveUrl
      ? this.googleDriveService.extractFolderId(data.googleDriveUrl)
      : null;

    const event = await this.prisma.event.create({
      data: {
        ...data,
        slug,
        driveFolderId,
        syncStatus: data.googleDriveUrl ? "SYNC_REQUIRED" : "NEVER_SYNCED",
      },
      include: {
        service: true,
      },
    });

    // Automatically trigger initial sync if Google Drive URL is provided
    if (data.googleDriveUrl) {
      // Run sync in background (don't await)
      this.syncPhotosFromGoogleDrive(event.id, data.country).catch((error) => {
        console.error(`Failed to auto-sync event ${event.id}:`, error.message);
      });
    }

    return event;
  }

  async findAll(
    country?: Country,
    serviceId?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const where: any = {};

    if (country) {
      where.country = country;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: { service: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.event.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    return {
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByService(
    serviceId: string,
    country?: Country,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const skip = (page - 1) * limit;

    // Validate sortBy field
    const allowedSortFields = ["name", "date", "createdAt", "updatedAt"];
    const orderByField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where: {
          serviceId,
          ...(country ? { country } : {}),
        },
        include: { service: true },
        skip,
        take: limit,
        orderBy: { [orderByField]: sortOrder },
      }),
      this.prisma.event.count({
        where: {
          serviceId,
          ...(country ? { country } : {}),
        },
      }),
    ]);

    // Convert BigInt values to strings for JSON serialization
    // const serializedEvents = events.map((event) => ({
    //   ...event,
    //   photos: event.photos.map((photo) => ({
    //     ...photo,
    //     fileSize: photo.fileSize ? photo.fileSize.toString() : null,
    //   })),
    // }));

    return {
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, country?: Country) {
    const event = await this.prisma.event.findUnique({
      where: country ? { id, country } : { id },
      include: { photos: true, service: true },
    });

    if (!event) return null;

    // Convert BigInt values to strings for JSON serialization
    return {
      ...event,
      photos: event.photos.map((photo) => ({
        ...photo,
        fileSize: photo.fileSize ? photo.fileSize.toString() : null,
      })),
    };
  }

  async findBySlug(slug: string, country?: Country) {
    const event = await this.prisma.event.findFirst({
      where: country ? { slug, country } : { slug },
      include: { photos: true, service: true },
    });

    if (!event) return null;

    // Convert BigInt values to strings for JSON serialization
    return {
      ...event,
      photos: event.photos.map((photo) => ({
        ...photo,
        fileSize: photo.fileSize ? photo.fileSize.toString() : null,
      })),
    };
  }

  async update(id: string, data: any, country?: Country) {
    // Verify ownership before updating
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id, country },
      });
      if (!event) {
        throw new NotFoundException("Event not found");
      }
    }

    if (data?.date && typeof data.date === "string")
      data.date = new Date(data.date);

    // Extract and update folder ID if Google Drive URL is changed
    if (data.googleDriveUrl) {
      data.driveFolderId = this.googleDriveService.extractFolderId(
        data.googleDriveUrl
      );
    }

    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string, country?: Country) {
    // Verify ownership before deleting
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id, country },
      });
      if (!event) {
        throw new NotFoundException("Event not found");
      }
    }

    return this.prisma.event.delete({ where: { id } });
  }

  async addPhotos(
    eventId: string,
    photos: { url: string; caption?: string; uploadedById?: string }[],
    country?: Country
  ) {
    // Verify event belongs to the requesting country
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, country },
      });
      if (!event) {
        throw new NotFoundException("Event not found");
      }
    }

    return this.prisma.photo.createMany({
      data: photos.map((p) => ({ ...p, eventId })),
    });
  }

  async listPhotos(
    eventId: string,
    country?: Country,
    page: number = 1,
    limit: number = 20
  ) {
    // Verify event belongs to the requesting country
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, country },
      });
      if (!event) {
        throw new NotFoundException("Event not found");
      }
    }

    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      this.prisma.photo.findMany({
        where: { eventId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.photo.count({ where: { eventId } }),
    ]);

    // Convert BigInt values to strings for JSON serialization
    const serializedPhotos = photos.map((photo) => ({
      ...photo,
      fileSize: photo.fileSize ? photo.fileSize.toString() : null,
    }));

    return {
      data: serializedPhotos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async syncPhotosFromGoogleDrive(eventId: string, country?: Country) {
    const event = await this.prisma.event.findFirst({
      where: country ? { id: eventId, country } : { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (!event.googleDriveUrl) {
      throw new BadRequestException(
        "Event does not have a Google Drive URL configured"
      );
    }

    try {
      // Update status to SYNCING
      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          syncStatus: "SYNCING",
          syncErrorMessage: null,
        },
      });

      const images = await this.googleDriveService.fetchImagesFromFolder(
        event.googleDriveUrl
      );

      // Store photos in database with Google Drive metadata
      // Include both direct Google Drive URL and backend proxy URL
      const photos = images.map((img) => ({
        eventId,
        url: `/api/v1/events/photos/proxy/${img.id}`, // Backend proxy URL (fallback)
        googleDriveUrl: this.googleDriveService.getPublicThumbnailUrl(img.id), // Direct Google Drive URL
        driveFileId: img.id,
        caption: img.name,
        status: "COMPLETE" as const,
        mimeType: img.mimeType,
        fileSize: BigInt(img.size || "0"),
        width: img.imageMediaMetadata?.width,
        height: img.imageMediaMetadata?.height,
      }));

      // Use transaction to ensure atomic operation
      await this.prisma.$transaction([
        this.prisma.photo.deleteMany({ where: { eventId } }),
        this.prisma.photo.createMany({ data: photos }),
        this.prisma.event.update({
          where: { id: eventId },
          data: {
            syncStatus: "UP_TO_DATE",
            lastSyncedAt: new Date(),
            syncErrorMessage: null,
          },
        }),
      ]);

      // Automatically generate cover image from first photo
      await this.updateGeneratedCoverImage(eventId);

      return {
        synced: photos.length,
        syncedAt: new Date(),
        photos: images,
      };
    } catch (error) {
      // Update status to ERROR
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          syncStatus: "ERROR",
          syncErrorMessage: errorMessage,
        },
      });

      // Ensure we throw a proper Error object
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(errorMessage);
      }
    }
  }

  async createShareableLink(photoIds: string[], country?: Country) {
    // Extract Google Drive IDs from photo URLs or use stored IDs
    const photos = await this.prisma.photo.findMany({
      where: { id: { in: photoIds } },
      include: { event: true },
    });

    // Verify all photos belong to events in the requesting country
    if (country) {
      const invalidPhoto = photos.find((p) => p.event?.country !== country);
      if (invalidPhoto) {
        throw new NotFoundException("Event not found");
      }
    }

    // For now, assume photo.url contains the Google Drive file ID or we need to extract it
    // This is a simplified version - you may need to store the Google Drive file ID separately
    const driveFileIds = photos
      .map((p) => {
        // Extract ID from thumbnail link if stored
        const match = p.url.match(/id=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    if (driveFileIds.length === 0) {
      throw new BadRequestException(
        "No valid Google Drive file IDs found in selected photos"
      );
    }

    return this.googleDriveService.createShareableLinkForPhotos(driveFileIds);
  }

  async getGoogleDriveImages(eventId: string, country?: Country) {
    const event = await this.prisma.event.findFirst({
      where: country ? { id: eventId, country } : { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (!event.googleDriveUrl) {
      throw new BadRequestException(
        "Event does not have a Google Drive URL configured"
      );
    }

    const images = await this.googleDriveService.fetchImagesFromFolder(
      event.googleDriveUrl
    );

    return {
      eventId,
      eventName: event.name,
      googleDriveUrl: event.googleDriveUrl,
      totalImages: images.length,
      images,
    };
  }

  /**
   * Create a download selection with a unique token
   * This allows users to share selected photos via a secure link
   */
  async createDownloadSelection(
    eventId: string,
    driveFileIds: string[],
    expirationHours?: number,
    country?: Country,
    deliverables?: string
  ) {
    // Verify event belongs to the requesting country
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, country },
      });
      if (!event) {
        throw new NotFoundException("Event not found");
      }
    }

    const token = randomUUID();
    const expiresAt = expirationHours
      ? new Date(Date.now() + expirationHours * 60 * 60 * 1000)
      : null;

    const selection = await this.prisma.downloadSelection.create({
      data: {
        eventId,
        photoIds: JSON.stringify(driveFileIds), // Store as JSON string
        token,
        expiresAt,
        photoCount: driveFileIds.length,
        deliverables: deliverables || "Digital Downloads",
        deliveryStatus: "PENDING_PAYMENT", // Default status
      },
    });

    return {
      id: selection.id,
      token: selection.token,
      shareLink: `/download/${selection.token}`,
      expiresAt: selection.expiresAt,
      deliveryStatus: selection.deliveryStatus,
    };
  }

  /**
   * Get download selection by token
   */
  async getDownloadSelection(token: string, country?: Country) {
    const selection = await this.prisma.downloadSelection.findUnique({
      where: { token },
      include: { event: true },
    });

    if (!selection) {
      throw new NotFoundException("Download selection not found");
    }

    // Verify the event belongs to the requesting country
    if (country && selection.event.country !== country) {
      throw new NotFoundException("Download selection not found");
    }

    // Check if expired
    if (selection.expiresAt && selection.expiresAt < new Date()) {
      throw new BadRequestException("Download selection has expired");
    }

    const driveFileIds = JSON.parse(selection.photoIds) as string[];

    // Fetch actual image data from Google Drive
    const images = await Promise.all(
      driveFileIds.map(async (fileId) => {
        return {
          id: fileId,
          downloadLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
          viewLink: `https://drive.google.com/file/d/${fileId}/view`,
        };
      })
    );

    return {
      event: {
        id: selection.event.id,
        name: selection.event.name,
      },
      images,
      createdAt: selection.createdAt,
      expiresAt: selection.expiresAt,
    };
  }

  /**
   * Enhanced version: Create selection from photo IDs (database photos)
   */
  async createDownloadSelectionFromPhotos(
    eventId: string,
    photoIds: string[],
    expirationHours?: number,
    country?: Country,
    deliverables?: string
  ) {
    // Verify event belongs to the requesting country
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, country },
      });
      if (!event) {
        throw new NotFoundException("Event not found");
      }
    }

    // Get photos from database
    const photos = await this.prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        eventId, // Ensure photos belong to the event
      },
    });

    if (photos.length === 0) {
      throw new NotFoundException("No valid photos found");
    }

    // Extract Google Drive file IDs
    const driveFileIds = photos
      .map((p) => p.driveFileId || this.extractDriveFileIdFromUrl(p.url))
      .filter(Boolean) as string[];

    if (driveFileIds.length === 0) {
      throw new BadRequestException(
        "No valid Google Drive file IDs found in selected photos"
      );
    }

    return this.createDownloadSelection(
      eventId,
      driveFileIds,
      expirationHours,
      country,
      deliverables
    );
  }

  /**
   * Helper to extract Drive file ID from URL
   */
  private extractDriveFileIdFromUrl(url: string): string | null {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Incremental sync using Google Drive Changes API
   * Only fetches new/modified photos since last sync
   */
  async syncPhotosIncremental(eventId: string, country?: Country) {
    const event = await this.prisma.event.findFirst({
      where: country ? { id: eventId, country } : { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (!event.googleDriveUrl) {
      throw new BadRequestException(
        "Event does not have a Google Drive URL configured"
      );
    }

    try {
      // Update status to SYNCING
      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          syncStatus: "SYNCING",
          syncErrorMessage: null,
        },
      });

      const { images, newPageToken, isFullSync } =
        await this.googleDriveService.fetchImagesIncremental(
          event.googleDriveUrl,
          event.driveChangeToken || undefined
        );

      if (isFullSync) {
        // Full sync - replace all photos
        const photos = images
          .filter((img) => !img.removed)
          .map((img) => ({
            eventId,
            url: `/api/v1/events/photos/proxy/${img.id}`, // Backend proxy URL (fallback)
            googleDriveUrl: this.googleDriveService.getPublicImageUrl(img.id), // Direct Google Drive URL
            driveFileId: img.id,
            caption: img.name,
            status: "COMPLETE" as const,
            mimeType: img.mimeType,
            fileSize: BigInt(img.size || "0"),
            width: img.imageMediaMetadata?.width,
            height: img.imageMediaMetadata?.height,
          }));

        await this.prisma.$transaction([
          this.prisma.photo.deleteMany({ where: { eventId } }),
          this.prisma.photo.createMany({ data: photos }),
          this.prisma.event.update({
            where: { id: eventId },
            data: {
              syncStatus: "UP_TO_DATE",
              lastSyncedAt: new Date(),
              syncErrorMessage: null,
              driveChangeToken: newPageToken,
            },
          }),
        ]);

        // Automatically generate cover image from first photo
        await this.updateGeneratedCoverImage(eventId);

        return {
          synced: photos.length,
          added: photos.length,
          removed: 0,
          isFullSync: true,
          syncedAt: new Date(),
        };
      } else {
        // Incremental sync - only process changes
        const removedImages = images.filter((img) => img.removed);
        const addedImages = images.filter((img) => !img.removed);

        const operations: any[] = [];

        // Remove deleted photos
        if (removedImages.length > 0) {
          operations.push(
            this.prisma.photo.deleteMany({
              where: {
                eventId,
                driveFileId: { in: removedImages.map((img) => img.id) },
              },
            })
          );
        }

        // Add new photos
        if (addedImages.length > 0) {
          const newPhotos = addedImages.map((img) => ({
            eventId,
            url: `/api/v1/events/photos/proxy/${img.id}`, // Backend proxy URL (fallback)
            googleDriveUrl: this.googleDriveService.getPublicImageUrl(img.id), // Direct Google Drive URL
            driveFileId: img.id,
            caption: img.name,
            status: "COMPLETE" as const,
            mimeType: img.mimeType,
            fileSize: BigInt(img.size || "0"),
            width: img.imageMediaMetadata?.width,
            height: img.imageMediaMetadata?.height,
          }));

          operations.push(this.prisma.photo.createMany({ data: newPhotos }));
        }

        // Update event status
        operations.push(
          this.prisma.event.update({
            where: { id: eventId },
            data: {
              syncStatus: "UP_TO_DATE",
              lastSyncedAt: new Date(),
              syncErrorMessage: null,
              driveChangeToken: newPageToken,
            },
          })
        );

        await this.prisma.$transaction(operations);

        // Update generated cover image if photos were added
        if (addedImages.length > 0) {
          await this.updateGeneratedCoverImage(eventId);
        }

        return {
          synced: addedImages.length + removedImages.length,
          added: addedImages.length,
          removed: removedImages.length,
          isFullSync: false,
          syncedAt: new Date(),
        };
      }
    } catch (error) {
      // Update status to ERROR
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          syncStatus: "ERROR",
          syncErrorMessage: errorMessage,
        },
      });

      // Ensure we throw a proper Error object
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * Get sync status for an event
   */
  async getSyncStatus(eventId: string, country?: Country) {
    const event = await this.prisma.event.findFirst({
      where: country ? { id: eventId, country } : { id: eventId },
      select: {
        id: true,
        name: true,
        syncStatus: true,
        lastSyncedAt: true,
        syncErrorMessage: true,
        googleDriveUrl: true,
        _count: {
          select: { photos: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return {
      eventId: event.id,
      eventName: event.name,
      syncStatus: event.syncStatus,
      lastSyncedAt: event.lastSyncedAt,
      syncErrorMessage: event.syncErrorMessage,
      hasGoogleDrive: !!event.googleDriveUrl,
      photoCount: event._count.photos,
    };
  }

  /**
   * Generate a URL-friendly slug from a string
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces and hyphens
      .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Delete expired download selections (cleanup job)
   */
  async cleanupExpiredSelections() {
    const result = await this.prisma.downloadSelection.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return { deleted: result.count };
  }

  /**
   * Get all events that need syncing
   */
  async getPendingSyncEvents(country?: Country) {
    const events = await this.prisma.event.findMany({
      where: {
        googleDriveUrl: { not: null },
        ...(country ? { country } : {}),
        OR: [
          { syncStatus: "SYNC_REQUIRED" },
          { syncStatus: "ERROR" },
          {
            AND: [
              { syncStatus: "UP_TO_DATE" },
              {
                OR: [
                  { lastSyncedAt: null },
                  {
                    lastSyncedAt: {
                      lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        syncStatus: true,
        lastSyncedAt: true,
        syncErrorMessage: true,
        _count: {
          select: { photos: true },
        },
      },
      orderBy: {
        lastSyncedAt: "asc",
      },
    });

    return {
      total: events.length,
      events: events.map((event) => ({
        id: event.id,
        name: event.name,
        syncStatus: event.syncStatus,
        lastSyncedAt: event.lastSyncedAt,
        syncErrorMessage: event.syncErrorMessage,
        photoCount: event._count.photos,
      })),
    };
  }

  /**
   * Trigger bulk sync for all events that need it
   */
  async triggerBulkSync(country?: Country) {
    const events = await this.prisma.event.findMany({
      where: {
        googleDriveUrl: { not: null },
        ...(country ? { country } : {}),
        syncStatus: { in: ["SYNC_REQUIRED", "ERROR"] },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Trigger syncs asynchronously (don't await)
    events.forEach((event) => {
      this.syncPhotosIncremental(event.id, country).catch((error) => {
        console.error(`Failed to sync event ${event.id}:`, error.message);
      });
    });

    return {
      triggered: events.length,
      message: `Triggered sync for ${events.length} events`,
      events: events.map((e) => ({ id: e.id, name: e.name })),
    };
  }

  /**
   * Get sync statistics across all events
   */
  async getSyncStatistics(country?: Country) {
    const where: any = {
      googleDriveUrl: { not: null },
    };

    if (country) {
      where.country = country;
    }

    const [
      total,
      neverSynced,
      upToDate,
      syncRequired,
      syncing,
      error,
      totalPhotos,
      lastSyncedEvent,
    ] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.count({
        where: { ...where, syncStatus: "NEVER_SYNCED" },
      }),
      this.prisma.event.count({
        where: { ...where, syncStatus: "UP_TO_DATE" },
      }),
      this.prisma.event.count({
        where: { ...where, syncStatus: "SYNC_REQUIRED" },
      }),
      this.prisma.event.count({ where: { ...where, syncStatus: "SYNCING" } }),
      this.prisma.event.count({ where: { ...where, syncStatus: "ERROR" } }),
      this.prisma.photo.count({
        where: {
          event: where,
        },
      }),
      this.prisma.event.findFirst({
        where: {
          ...where,
          lastSyncedAt: { not: null },
        },
        orderBy: {
          lastSyncedAt: "desc",
        },
        select: {
          id: true,
          name: true,
          lastSyncedAt: true,
          syncStatus: true,
          _count: {
            select: { photos: true },
          },
        },
      }),
    ]);

    return {
      total,
      byStatus: {
        neverSynced,
        upToDate,
        syncRequired,
        syncing,
        error,
      },
      totalPhotos,
      lastSyncedEvent: lastSyncedEvent
        ? {
            id: lastSyncedEvent.id,
            name: lastSyncedEvent.name,
            lastSyncedAt: lastSyncedEvent.lastSyncedAt,
            syncStatus: lastSyncedEvent.syncStatus,
            photoCount: lastSyncedEvent._count.photos,
          }
        : null,
    };
  }

  /**
   * List download requests with optional filters
   */
  async listDownloadRequests(filters?: {
    status?: string;
    eventId?: string;
    startDate?: string;
    endDate?: string;
    country?: Country;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.deliveryStatus = filters.status;
    }

    if (filters?.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters?.country) {
      where.event = {
        country: filters.country,
      };
    }

    const [requests, total] = await Promise.all([
      this.prisma.downloadSelection.findMany({
        where,
        skip,
        take: limit,
        include: {
          event: {
            include: {
              client: true,
              service: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.downloadSelection.count({ where }),
    ]);

    return {
      data: requests.map((req) => ({
        id: req.id,
        token: req.token,
        event: {
          id: req.event.id,
          name: req.event.name,
          service: req.event.service,
          date: req.event.date,
        },
        client: req.event.client
          ? {
              id: req.event.client.id,
              name: req.event.client.name,
              email: req.event.client.email,
            }
          : null,
        photoCount: req.photoCount,
        deliverables: req.deliverables,
        deliveryStatus: req.deliveryStatus,
        paymentStatus: req.paymentStatus,
        paymentAmount: req.paymentAmount,
        paymentCurrency: req.paymentCurrency,
        createdAt: req.createdAt,
        expiresAt: req.expiresAt,
        approvedAt: req.approvedAt,
        completedAt: req.completedAt,
        rejectionReason: req.rejectionReason,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update download request status
   */
  async updateDownloadStatus(
    requestId: string,
    status: string,
    options?: {
      rejectionReason?: string;
      approvedBy?: string;
      country?: Country;
    }
  ) {
    // Verify the request exists and belongs to the country
    const request = await this.prisma.downloadSelection.findUnique({
      where: { id: requestId },
      include: { event: true },
    });

    if (!request) {
      throw new NotFoundException("Download request not found");
    }

    if (options?.country && request.event.country !== options.country) {
      throw new NotFoundException("Download request not found");
    }

    const updateData: any = {
      deliveryStatus: status,
      updatedAt: new Date(),
    };

    // Handle status-specific updates
    if (status === "PENDING_APPROVAL" || status === "APPROVED") {
      updateData.approvedAt = new Date();
      if (options?.approvedBy) {
        updateData.approvedBy = options.approvedBy;
      }
    }

    if (status === "SHIPPED") {
      updateData.completedAt = new Date();
    }

    if (status === "REJECTED") {
      if (!options?.rejectionReason) {
        throw new BadRequestException(
          "Rejection reason is required when rejecting a request"
        );
      }
      updateData.rejectionReason = options.rejectionReason;
    }

    const updated = await this.prisma.downloadSelection.update({
      where: { id: requestId },
      data: updateData,
      include: {
        event: {
          include: {
            client: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      token: updated.token,
      deliveryStatus: updated.deliveryStatus,
      event: {
        id: updated.event.id,
        name: updated.event.name,
      },
      client: updated.event.client,
      approvedAt: updated.approvedAt,
      completedAt: updated.completedAt,
      rejectionReason: updated.rejectionReason,
    };
  }

  /**
   * Approve a download request
   */
  async approveDownloadRequest(
    requestId: string,
    approvedBy?: string,
    country?: Country
  ) {
    return this.updateDownloadStatus(requestId, "PENDING_APPROVAL", {
      approvedBy,
      country,
    });
  }

  /**
   * Reject a download request
   */
  async rejectDownloadRequest(
    requestId: string,
    rejectionReason: string,
    country?: Country
  ) {
    return this.updateDownloadStatus(requestId, "REJECTED", {
      rejectionReason,
      country,
    });
  }

  /**
   * Get download request statistics
   */
  async getDownloadRequestStats(country?: Country) {
    const where: any = country ? { event: { country } } : {};

    const [
      total,
      pendingPayment,
      pendingApproval,
      processing,
      shipped,
      rejected,
    ] = await Promise.all([
      this.prisma.downloadSelection.count({ where }),
      this.prisma.downloadSelection.count({
        where: { ...where, deliveryStatus: "PENDING_PAYMENT" },
      }),
      this.prisma.downloadSelection.count({
        where: { ...where, deliveryStatus: "PENDING_APPROVAL" },
      }),
      this.prisma.downloadSelection.count({
        where: { ...where, deliveryStatus: "PROCESSING_DELIVERY" },
      }),
      this.prisma.downloadSelection.count({
        where: { ...where, deliveryStatus: "SHIPPED" },
      }),
      this.prisma.downloadSelection.count({
        where: { ...where, deliveryStatus: "REJECTED" },
      }),
    ]);

    return {
      total,
      byStatus: {
        pendingPayment,
        pendingApproval,
        processing,
        shipped,
        rejected,
      },
    };
  }

  /**
   * Stream photo from Google Drive (for proxy endpoint)
   * @param driveFileId - Google Drive file ID
   * @param size - Optional thumbnail width for optimization (e.g., 400, 800, 1200)
   */
  async streamPhotoFromDrive(driveFileId: string, size?: number) {
    return this.googleDriveService.streamFile(driveFileId, size);
  }

  /**
   * Automatically update the generated cover image URL for an event
   * Uses the first photo from the event's photo collection
   */
  async updateGeneratedCoverImage(eventId: string) {
    // Get the first photo for this event
    const firstPhoto = await this.prisma.photo.findFirst({
      where: { eventId },
      orderBy: { createdAt: "asc" },
      select: {
        googleDriveUrl: true,
        url: true,
      },
    });

    // Update the event with both generated cover images
    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        generatedCoverImageUrl: firstPhoto?.googleDriveUrl || null,
        generatedCoverImageProxyUrl: firstPhoto?.url || null,
      },
    });

    return firstPhoto;
  }

  /**
   * Manually regenerate cover image for an event
   * Can be called via API endpoint
   */
  async regenerateCoverImage(eventId: string, country?: Country) {
    // Verify event belongs to the requesting country
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, country },
      });
      if (!event) {
        throw new NotFoundException("Event not found");
      }
    }

    const result = await this.updateGeneratedCoverImage(eventId);

    if (!result) {
      throw new BadRequestException(
        "No photos available to generate cover image"
      );
    }

    return {
      eventId,
      generatedCoverImageUrl: result.googleDriveUrl || null,
      generatedCoverImageProxyUrl: result.url || null,
      message: "Cover image regenerated successfully",
    };
  }
}
