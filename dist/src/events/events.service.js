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
    async create(data) {
        if (typeof data.date === "string")
            data.date = new Date(data.date);
        const slug = data.slug || this.generateSlug(data.name);
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
        if (data.googleDriveUrl) {
            this.syncPhotosFromGoogleDrive(event.id, data.country).catch((error) => {
                console.error(`Failed to auto-sync event ${event.id}:`, error.message);
            });
        }
        return event;
    }
    async findAll(country, serviceId, page = 1, limit = 10) {
        const where = {};
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
    async findByService(serviceId, country, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") {
        const skip = (page - 1) * limit;
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
    async findOne(id, country) {
        const event = await this.prisma.event.findUnique({
            where: country ? { id, country } : { id },
            include: { photos: true, service: true },
        });
        if (!event)
            return null;
        return {
            ...event,
            photos: event.photos.map((photo) => ({
                ...photo,
                fileSize: photo.fileSize ? photo.fileSize.toString() : null,
            })),
        };
    }
    async findBySlug(slug, country) {
        const event = await this.prisma.event.findFirst({
            where: country ? { slug, country } : { slug },
            include: { photos: true, service: true },
        });
        if (!event)
            return null;
        return {
            ...event,
            photos: event.photos.map((photo) => ({
                ...photo,
                fileSize: photo.fileSize ? photo.fileSize.toString() : null,
            })),
        };
    }
    async update(id, data, country) {
        if (country) {
            const event = await this.prisma.event.findFirst({
                where: { id, country },
            });
            if (!event) {
                throw new common_1.NotFoundException("Event not found");
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
                throw new common_1.NotFoundException("Event not found");
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
                throw new common_1.NotFoundException("Event not found");
            }
        }
        return this.prisma.photo.createMany({
            data: photos.map((p) => ({ ...p, eventId })),
        });
    }
    async listPhotos(eventId, country, page = 1, limit = 20) {
        if (country) {
            const event = await this.prisma.event.findFirst({
                where: { id: eventId, country },
            });
            if (!event) {
                throw new common_1.NotFoundException("Event not found");
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
    async syncPhotosFromGoogleDrive(eventId, country) {
        const event = await this.prisma.event.findFirst({
            where: country ? { id: eventId, country } : { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException("Event not found");
        }
        if (!event.googleDriveUrl) {
            throw new common_1.BadRequestException("Event does not have a Google Drive URL configured");
        }
        try {
            await this.prisma.event.update({
                where: { id: eventId },
                data: {
                    syncStatus: "SYNCING",
                    syncErrorMessage: null,
                },
            });
            const images = await this.googleDriveService.fetchImagesFromFolder(event.googleDriveUrl);
            const photos = images.map((img) => ({
                eventId,
                url: `/api/v1/events/photos/proxy/${img.id}`,
                googleDriveUrl: this.googleDriveService.getPublicImageUrl(img.id),
                driveFileId: img.id,
                caption: img.name,
                status: "COMPLETE",
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
                    },
                }),
            ]);
            await this.updateGeneratedCoverImage(eventId);
            return {
                synced: photos.length,
                syncedAt: new Date(),
                photos: images,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            await this.prisma.event.update({
                where: { id: eventId },
                data: {
                    syncStatus: "ERROR",
                    syncErrorMessage: errorMessage,
                },
            });
            if (error instanceof Error) {
                throw error;
            }
            else {
                throw new Error(errorMessage);
            }
        }
    }
    async createShareableLink(photoIds, country) {
        const photos = await this.prisma.photo.findMany({
            where: { id: { in: photoIds } },
            include: { event: true },
        });
        if (country) {
            const invalidPhoto = photos.find((p) => p.event?.country !== country);
            if (invalidPhoto) {
                throw new common_1.NotFoundException("Event not found");
            }
        }
        const driveFileIds = photos
            .map((p) => {
            const match = p.url.match(/id=([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        })
            .filter(Boolean);
        if (driveFileIds.length === 0) {
            throw new common_1.BadRequestException("No valid Google Drive file IDs found in selected photos");
        }
        return this.googleDriveService.createShareableLinkForPhotos(driveFileIds);
    }
    async getGoogleDriveImages(eventId, country) {
        const event = await this.prisma.event.findFirst({
            where: country ? { id: eventId, country } : { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException("Event not found");
        }
        if (!event.googleDriveUrl) {
            throw new common_1.BadRequestException("Event does not have a Google Drive URL configured");
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
    async createDownloadSelection(eventId, driveFileIds, expirationHours, country, deliverables) {
        if (country) {
            const event = await this.prisma.event.findFirst({
                where: { id: eventId, country },
            });
            if (!event) {
                throw new common_1.NotFoundException("Event not found");
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
                photoCount: driveFileIds.length,
                deliverables: deliverables || "Digital Downloads",
                deliveryStatus: "PENDING_PAYMENT",
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
    async getDownloadSelection(token, country) {
        const selection = await this.prisma.downloadSelection.findUnique({
            where: { token },
            include: { event: true },
        });
        if (!selection) {
            throw new common_1.NotFoundException("Download selection not found");
        }
        if (country && selection.event.country !== country) {
            throw new common_1.NotFoundException("Download selection not found");
        }
        if (selection.expiresAt && selection.expiresAt < new Date()) {
            throw new common_1.BadRequestException("Download selection has expired");
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
    async createDownloadSelectionFromPhotos(eventId, photoIds, expirationHours, country, deliverables) {
        if (country) {
            const event = await this.prisma.event.findFirst({
                where: { id: eventId, country },
            });
            if (!event) {
                throw new common_1.NotFoundException("Event not found");
            }
        }
        const photos = await this.prisma.photo.findMany({
            where: {
                id: { in: photoIds },
                eventId,
            },
        });
        if (photos.length === 0) {
            throw new common_1.NotFoundException("No valid photos found");
        }
        const driveFileIds = photos
            .map((p) => p.driveFileId || this.extractDriveFileIdFromUrl(p.url))
            .filter(Boolean);
        if (driveFileIds.length === 0) {
            throw new common_1.BadRequestException("No valid Google Drive file IDs found in selected photos");
        }
        return this.createDownloadSelection(eventId, driveFileIds, expirationHours, country, deliverables);
    }
    extractDriveFileIdFromUrl(url) {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }
    async syncPhotosIncremental(eventId, country) {
        const event = await this.prisma.event.findFirst({
            where: country ? { id: eventId, country } : { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException("Event not found");
        }
        if (!event.googleDriveUrl) {
            throw new common_1.BadRequestException("Event does not have a Google Drive URL configured");
        }
        try {
            await this.prisma.event.update({
                where: { id: eventId },
                data: {
                    syncStatus: "SYNCING",
                    syncErrorMessage: null,
                },
            });
            const { images, newPageToken, isFullSync } = await this.googleDriveService.fetchImagesIncremental(event.googleDriveUrl, event.driveChangeToken || undefined);
            if (isFullSync) {
                const photos = images
                    .filter((img) => !img.removed)
                    .map((img) => ({
                    eventId,
                    url: `/api/v1/events/photos/proxy/${img.id}`,
                    googleDriveUrl: this.googleDriveService.getPublicImageUrl(img.id),
                    driveFileId: img.id,
                    caption: img.name,
                    status: "COMPLETE",
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
                await this.updateGeneratedCoverImage(eventId);
                return {
                    synced: photos.length,
                    added: photos.length,
                    removed: 0,
                    isFullSync: true,
                    syncedAt: new Date(),
                };
            }
            else {
                const removedImages = images.filter((img) => img.removed);
                const addedImages = images.filter((img) => !img.removed);
                const operations = [];
                if (removedImages.length > 0) {
                    operations.push(this.prisma.photo.deleteMany({
                        where: {
                            eventId,
                            driveFileId: { in: removedImages.map((img) => img.id) },
                        },
                    }));
                }
                if (addedImages.length > 0) {
                    const newPhotos = addedImages.map((img) => ({
                        eventId,
                        url: `/api/v1/events/photos/proxy/${img.id}`,
                        googleDriveUrl: this.googleDriveService.getPublicImageUrl(img.id),
                        driveFileId: img.id,
                        caption: img.name,
                        status: "COMPLETE",
                        mimeType: img.mimeType,
                        fileSize: BigInt(img.size || "0"),
                        width: img.imageMediaMetadata?.width,
                        height: img.imageMediaMetadata?.height,
                    }));
                    operations.push(this.prisma.photo.createMany({ data: newPhotos }));
                }
                operations.push(this.prisma.event.update({
                    where: { id: eventId },
                    data: {
                        syncStatus: "UP_TO_DATE",
                        lastSyncedAt: new Date(),
                        syncErrorMessage: null,
                        driveChangeToken: newPageToken,
                    },
                }));
                await this.prisma.$transaction(operations);
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            await this.prisma.event.update({
                where: { id: eventId },
                data: {
                    syncStatus: "ERROR",
                    syncErrorMessage: errorMessage,
                },
            });
            if (error instanceof Error) {
                throw error;
            }
            else {
                throw new Error(errorMessage);
            }
        }
    }
    async getSyncStatus(eventId, country) {
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
            throw new common_1.NotFoundException("Event not found");
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
    generateSlug(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_]+/g, "-")
            .replace(/^-+|-+$/g, "");
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
    async getPendingSyncEvents(country) {
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
    async triggerBulkSync(country) {
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
    async getSyncStatistics(country) {
        const where = {
            googleDriveUrl: { not: null },
        };
        if (country) {
            where.country = country;
        }
        const [total, neverSynced, upToDate, syncRequired, syncing, error, totalPhotos, lastSyncedEvent,] = await Promise.all([
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
    async listDownloadRequests(filters) {
        const where = {};
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
        const requests = await this.prisma.downloadSelection.findMany({
            where,
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
        });
        return requests.map((req) => ({
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
            createdAt: req.createdAt,
            expiresAt: req.expiresAt,
            approvedAt: req.approvedAt,
            completedAt: req.completedAt,
            rejectionReason: req.rejectionReason,
        }));
    }
    async updateDownloadStatus(requestId, status, options) {
        const request = await this.prisma.downloadSelection.findUnique({
            where: { id: requestId },
            include: { event: true },
        });
        if (!request) {
            throw new common_1.NotFoundException("Download request not found");
        }
        if (options?.country && request.event.country !== options.country) {
            throw new common_1.NotFoundException("Download request not found");
        }
        const updateData = {
            deliveryStatus: status,
            updatedAt: new Date(),
        };
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
                throw new common_1.BadRequestException("Rejection reason is required when rejecting a request");
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
    async approveDownloadRequest(requestId, approvedBy, country) {
        return this.updateDownloadStatus(requestId, "PENDING_APPROVAL", {
            approvedBy,
            country,
        });
    }
    async rejectDownloadRequest(requestId, rejectionReason, country) {
        return this.updateDownloadStatus(requestId, "REJECTED", {
            rejectionReason,
            country,
        });
    }
    async getDownloadRequestStats(country) {
        const where = country ? { event: { country } } : {};
        const [total, pendingPayment, pendingApproval, processing, shipped, rejected,] = await Promise.all([
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
    async streamPhotoFromDrive(driveFileId, size) {
        return this.googleDriveService.streamFile(driveFileId, size);
    }
    async updateGeneratedCoverImage(eventId) {
        const firstPhoto = await this.prisma.photo.findFirst({
            where: { eventId },
            orderBy: { createdAt: "asc" },
            select: {
                googleDriveUrl: true,
                url: true,
            },
        });
        await this.prisma.event.update({
            where: { id: eventId },
            data: {
                generatedCoverImageUrl: firstPhoto?.googleDriveUrl || null,
                generatedCoverImageProxyUrl: firstPhoto?.url || null,
            },
        });
        return firstPhoto;
    }
    async regenerateCoverImage(eventId, country) {
        if (country) {
            const event = await this.prisma.event.findFirst({
                where: { id: eventId, country },
            });
            if (!event) {
                throw new common_1.NotFoundException("Event not found");
            }
        }
        const result = await this.updateGeneratedCoverImage(eventId);
        if (!result) {
            throw new common_1.BadRequestException("No photos available to generate cover image");
        }
        return {
            eventId,
            generatedCoverImageUrl: result.googleDriveUrl || null,
            generatedCoverImageProxyUrl: result.url || null,
            message: "Cover image regenerated successfully",
        };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        google_drive_service_1.GoogleDriveService])
], EventsService);
//# sourceMappingURL=events.service.js.map