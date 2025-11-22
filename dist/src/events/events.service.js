"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const google_drive_service_1 = require("../google-drive/google-drive.service");
const crypto_1 = require("crypto");
let EventsService = class EventsService {
    constructor(prisma, googleDriveService) {
        this.prisma = prisma;
        this.googleDriveService = googleDriveService;
    }
    create(data) {
        if (typeof data.date === "string")
            data.date = new Date(data.date);
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
    findAll(country) {
        return this.prisma.event.findMany({
            where: country ? { country } : undefined,
            include: { photos: true },
        });
    }
    findOne(id, country) {
        return this.prisma.event.findUnique({
            where: country ? { id, country } : { id },
            include: { photos: true },
        });
    }
    async update(id, data, country) {
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
        if (data.googleDriveUrl) {
            data.driveFolderId = this.googleDriveService.extractFolderId(data.googleDriveUrl);
        }
        return this.prisma.event.update({ where: { id }, data });
    }
    async remove(id, country) {
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
    async addPhotos(eventId, photos, country) {
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
    async listPhotos(eventId, country) {
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
    async syncPhotosFromGoogleDrive(eventId, country) {
        const event = await this.prisma.event.findFirst({
            where: country ? { id: eventId, country } : { id: eventId },
        });
        if (!event) {
            throw new Error("Event not found");
        }
        if (!event.googleDriveUrl) {
            throw new Error("Event does not have a Google Drive URL configured");
        }
        const images = await this.googleDriveService.fetchImagesFromFolder(event.googleDriveUrl);
        const photos = images.map((img) => ({
            eventId,
            url: img.thumbnailLink,
            driveFileId: img.id,
            caption: img.name,
            status: "COMPLETE",
        }));
        await this.prisma.$transaction([
            this.prisma.photo.deleteMany({ where: { eventId } }),
            this.prisma.photo.createMany({ data: photos }),
        ]);
        return { synced: photos.length, photos: images };
    }
    async createShareableLink(photoIds, country) {
        const photos = await this.prisma.photo.findMany({
            where: { id: { in: photoIds } },
            include: { event: true },
        });
        if (country) {
            const invalidPhoto = photos.find(p => p.event?.country !== country);
            if (invalidPhoto) {
                throw new Error('Event not found');
            }
        }
        const driveFileIds = photos
            .map((p) => {
            const match = p.url.match(/id=([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        })
            .filter(Boolean);
        if (driveFileIds.length === 0) {
            throw new Error("No valid Google Drive file IDs found in selected photos");
        }
        return this.googleDriveService.createShareableLinkForPhotos(driveFileIds);
    }
    async getGoogleDriveImages(eventId, country) {
        const event = await this.prisma.event.findFirst({
            where: country ? { id: eventId, country } : { id: eventId },
        });
        if (!event) {
            throw new Error("Event not found");
        }
        if (!event.googleDriveUrl) {
            throw new Error("Event does not have a Google Drive URL configured");
        }
        const images = await this.googleDriveService.fetchImagesFromFolder(event.googleDriveUrl);
        return {
            eventId,
            eventName: event.name,
            googleDriveUrl: event.googleDriveUrl,
            totalImages: images.length,
            images,
        };
    }
    async createDownloadSelection(eventId, driveFileIds, expirationHours, country) {
        if (country) {
            const event = await this.prisma.event.findFirst({
                where: { id: eventId, country },
            });
            if (!event) {
                throw new Error('Event not found');
            }
        }
        const token = (0, crypto_1.randomUUID)();
        const expiresAt = expirationHours
            ? new Date(Date.now() + expirationHours * 60 * 60 * 1000)
            : null;
        const selection = await this.prisma.downloadSelection.create({
            data: {
                eventId,
                photoIds: JSON.stringify(driveFileIds),
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
    async getDownloadSelection(token, country) {
        const selection = await this.prisma.downloadSelection.findUnique({
            where: { token },
            include: { event: true },
        });
        if (!selection) {
            throw new Error("Download selection not found");
        }
        if (country && selection.event.country !== country) {
            throw new Error('Download selection not found');
        }
        if (selection.expiresAt && selection.expiresAt < new Date()) {
            throw new Error("Download selection has expired");
        }
        const driveFileIds = JSON.parse(selection.photoIds);
        const images = await Promise.all(driveFileIds.map(async (fileId) => {
            return {
                id: fileId,
                downloadLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
                viewLink: `https://drive.google.com/file/d/${fileId}/view`,
            };
        }));
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
    async createDownloadSelectionFromPhotos(eventId, photoIds, expirationHours, country) {
        if (country) {
            const event = await this.prisma.event.findFirst({
                where: { id: eventId, country },
            });
            if (!event) {
                throw new Error('Event not found');
            }
        }
        const photos = await this.prisma.photo.findMany({
            where: {
                id: { in: photoIds },
                eventId,
            },
        });
        if (photos.length === 0) {
            throw new Error("No valid photos found");
        }
        const driveFileIds = photos
            .map((p) => p.driveFileId || this.extractDriveFileIdFromUrl(p.url))
            .filter(Boolean);
        if (driveFileIds.length === 0) {
            throw new Error("No valid Google Drive file IDs found in selected photos");
        }
        return this.createDownloadSelection(eventId, driveFileIds, expirationHours, country);
    }
    extractDriveFileIdFromUrl(url) {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        google_drive_service_1.GoogleDriveService])
], EventsService);
//# sourceMappingURL=events.service.js.map