import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EventCategory, Country } from "@prisma/client";
import { GoogleDriveService } from "../google-drive/google-drive.service";
import { randomUUID } from "crypto";

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDriveService: GoogleDriveService
  ) {}

  create(data: {
    name: string;
    slug: string;
    category: EventCategory;
    description?: string;
    date?: string | Date;
    location?: string;
    coverImageUrl?: string;
    googleDriveUrl?: string;
    clientId?: string;
    country?: Country;
  }) {
    if (typeof data.date === "string") data.date = new Date(data.date);

    // Extract and store folder ID if Google Drive URL is provided
    const driveFolderId = data.googleDriveUrl
      ? this.googleDriveService.extractFolderId(data.googleDriveUrl)
      : null;

    return this.prisma.event.create({
      data: {
        ...data,
        driveFolderId,
      },
    });
  }

  findAll(country?: Country) {
    return this.prisma.event.findMany({
      where: country ? { country } : undefined,
      include: { photos: true },
    });
  }

  findOne(id: string, country?: Country) {
    return this.prisma.event.findUnique({
      where: country ? { id, country } : { id },
      include: { photos: true },
    });
  }

  async update(id: string, data: any, country?: Country) {
    // Verify ownership before updating
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id, country },
      });
      if (!event) {
        throw new Error('Event not found');
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
        throw new Error('Event not found');
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
        throw new Error('Event not found');
      }
    }

    return this.prisma.photo.createMany({
      data: photos.map((p) => ({ ...p, eventId })),
    });
  }

  async listPhotos(eventId: string, country?: Country) {
    // Verify event belongs to the requesting country
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, country },
      });
      if (!event) {
        throw new Error('Event not found');
      }
    }

    return this.prisma.photo.findMany({ where: { eventId } });
  }

  async syncPhotosFromGoogleDrive(eventId: string, country?: Country) {
    const event = await this.prisma.event.findFirst({
      where: country ? { id: eventId, country } : { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (!event.googleDriveUrl) {
      throw new Error("Event does not have a Google Drive URL configured");
    }

    const images = await this.googleDriveService.fetchImagesFromFolder(
      event.googleDriveUrl
    );

    // Store photos in database with Google Drive metadata
    const photos = images.map((img) => ({
      eventId,
      url: img.thumbnailLink,
      driveFileId: img.id, // Store the Google Drive file ID
      caption: img.name,
      status: "COMPLETE" as const,
    }));

    // Use transaction to ensure atomic operation
    await this.prisma.$transaction([
      this.prisma.photo.deleteMany({ where: { eventId } }),
      this.prisma.photo.createMany({ data: photos }),
    ]);

    return { synced: photos.length, photos: images };
  }

  async createShareableLink(photoIds: string[], country?: Country) {
    // Extract Google Drive IDs from photo URLs or use stored IDs
    const photos = await this.prisma.photo.findMany({
      where: { id: { in: photoIds } },
      include: { event: true },
    });

    // Verify all photos belong to events in the requesting country
    if (country) {
      const invalidPhoto = photos.find(p => p.event?.country !== country);
      if (invalidPhoto) {
        throw new Error('Event not found');
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
      throw new Error(
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
      throw new Error("Event not found");
    }

    if (!event.googleDriveUrl) {
      throw new Error("Event does not have a Google Drive URL configured");
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
    country?: Country
  ) {
    // Verify event belongs to the requesting country
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, country },
      });
      if (!event) {
        throw new Error('Event not found');
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
      },
    });

    return {
      token: selection.token,
      shareLink: `/download/${selection.token}`,
      expiresAt: selection.expiresAt,
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
      throw new Error("Download selection not found");
    }

    // Verify the event belongs to the requesting country
    if (country && selection.event.country !== country) {
      throw new Error('Download selection not found');
    }

    // Check if expired
    if (selection.expiresAt && selection.expiresAt < new Date()) {
      throw new Error("Download selection has expired");
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
    country?: Country
  ) {
    // Verify event belongs to the requesting country
    if (country) {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, country },
      });
      if (!event) {
        throw new Error('Event not found');
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
      throw new Error("No valid photos found");
    }

    // Extract Google Drive file IDs
    const driveFileIds = photos
      .map((p) => p.driveFileId || this.extractDriveFileIdFromUrl(p.url))
      .filter(Boolean) as string[];

    if (driveFileIds.length === 0) {
      throw new Error(
        "No valid Google Drive file IDs found in selected photos"
      );
    }

    return this.createDownloadSelection(eventId, driveFileIds, expirationHours, country);
  }

  /**
   * Helper to extract Drive file ID from URL
   */
  private extractDriveFileIdFromUrl(url: string): string | null {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
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
}
