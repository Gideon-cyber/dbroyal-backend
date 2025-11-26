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
var GoogleDriveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
const config_1 = require("@nestjs/config");
const sharp_1 = require("sharp");
const stream_1 = require("stream");
let GoogleDriveService = GoogleDriveService_1 = class GoogleDriveService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GoogleDriveService_1.name);
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: this.configService.get("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
                private_key: this.configService
                    .get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")
                    ?.replace(/\\n/g, "\n"),
            },
            scopes: [
                "https://www.googleapis.com/auth/drive.readonly",
                "https://www.googleapis.com/auth/drive.metadata.readonly",
                "https://www.googleapis.com/auth/drive",
            ],
        });
        this.drive = googleapis_1.google.drive({ version: "v3", auth });
    }
    extractFolderId(url) {
        const patterns = [/\/folders\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match)
                return match[1];
        }
        return null;
    }
    async fetchImagesFromFolder(folderUrl) {
        const folderId = this.extractFolderId(folderUrl);
        if (!folderId) {
            throw new common_1.BadRequestException("Invalid Google Drive folder URL");
        }
        try {
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
                fields: "files(id, name, webViewLink, thumbnailLink, webContentLink, mimeType, size, imageMediaMetadata)",
                pageSize: 1000,
            });
            const files = response.data.files || [];
            return files.map((file) => ({
                id: file.id || "",
                name: file.name || "",
                webViewLink: file.webViewLink || "",
                thumbnailLink: file.thumbnailLink || "",
                downloadLink: `https://drive.google.com/uc?export=download&id=${file.id}`,
                mimeType: file.mimeType || "",
                size: file.size || "0",
                imageMediaMetadata: file.imageMediaMetadata
                    ? {
                        width: file.imageMediaMetadata.width || 0,
                        height: file.imageMediaMetadata.height || 0,
                    }
                    : undefined,
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to fetch images from Google Drive: ${errorMessage}`);
            throw new common_1.InternalServerErrorException("Failed to fetch images from Google Drive. Ensure the folder is shared with the service account.");
        }
    }
    async createShareableLinkForPhotos(photoIds) {
        try {
            const folderMetadata = {
                name: `Selected Photos - ${new Date().toISOString()}`,
                mimeType: "application/vnd.google-apps.folder",
            };
            const folder = await this.drive.files.create({
                requestBody: folderMetadata,
                fields: "id, webViewLink",
            });
            const folderId = folder.data.id;
            const BATCH_SIZE = 5;
            for (let i = 0; i < photoIds.length; i += BATCH_SIZE) {
                const batch = photoIds.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map((photoId) => this.drive.files.copy({
                    fileId: photoId,
                    requestBody: {
                        parents: [folderId],
                    },
                })));
            }
            await this.drive.permissions.create({
                fileId: folderId,
                requestBody: {
                    role: "reader",
                    type: "anyone",
                },
            });
            return (folder.data.webViewLink ||
                `https://drive.google.com/drive/folders/${folderId}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to create shareable link: ${errorMessage}`);
            throw new common_1.InternalServerErrorException("Failed to create shareable link for selected photos");
        }
    }
    async getDownloadLink(fileId) {
        try {
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to generate download link: ${errorMessage}`);
            throw new common_1.InternalServerErrorException("Failed to generate download link");
        }
    }
    async downloadMultiplePhotos(fileIds) {
        return this.createShareableLinkForPhotos(fileIds);
    }
    async getFilesMetadata(fileIds) {
        try {
            const filesData = await Promise.all(fileIds.map(async (fileId) => {
                try {
                    const file = await this.drive.files.get({
                        fileId,
                        fields: "id, name, mimeType, size, webViewLink, thumbnailLink",
                    });
                    return {
                        id: file.data.id || "",
                        name: file.data.name || "",
                        mimeType: file.data.mimeType || "",
                        size: file.data.size || "0",
                        webViewLink: file.data.webViewLink || "",
                        thumbnailLink: file.data.thumbnailLink || "",
                        downloadLink: `https://drive.google.com/uc?export=download&id=${file.data.id}`,
                    };
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.warn(`Failed to fetch metadata for file ${fileId}: ${errorMessage}`);
                    return null;
                }
            }));
            return filesData.filter(Boolean);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to fetch files metadata: ${errorMessage}`);
            throw new common_1.InternalServerErrorException("Failed to fetch files metadata");
        }
    }
    async downloadFileAsBuffer(fileId) {
        try {
            const file = await this.drive.files.get({
                fileId,
                fields: "name",
            });
            const response = await this.drive.files.get({
                fileId,
                alt: "media",
            }, { responseType: "arraybuffer" });
            return {
                buffer: Buffer.from(response.data),
                filename: file.data.name || `file-${fileId}`,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to download file ${fileId}: ${errorMessage}`);
            throw new common_1.InternalServerErrorException(`Failed to download file: ${errorMessage}`);
        }
    }
    async getStartPageToken() {
        try {
            const response = await this.drive.changes.getStartPageToken({
                supportsAllDrives: false,
            });
            return response.data.startPageToken || "";
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to get start page token: ${errorMessage}`);
            throw new common_1.InternalServerErrorException("Failed to initialize change tracking");
        }
    }
    async fetchImageChanges(folderId, pageToken) {
        try {
            const changes = await this.drive.changes.list({
                pageToken,
                spaces: "drive",
                fields: "nextPageToken, newStartPageToken, changes(fileId, removed, file(id, name, webViewLink, thumbnailLink, mimeType, size, imageMediaMetadata, parents))",
            });
            const relevantChanges = changes.data.changes?.filter((change) => {
                if (!change.file)
                    return false;
                const isInFolder = change.file.parents?.includes(folderId);
                const isImage = change.file.mimeType?.includes("image/");
                return isInFolder && (isImage || change.removed);
            }) || [];
            const images = relevantChanges.map((change) => {
                if (change.removed || !change.file) {
                    return {
                        id: change.fileId || "",
                        name: "",
                        webViewLink: "",
                        thumbnailLink: "",
                        downloadLink: "",
                        mimeType: "",
                        size: "0",
                        removed: true,
                    };
                }
                const file = change.file;
                return {
                    id: file.id || "",
                    name: file.name || "",
                    webViewLink: file.webViewLink || "",
                    thumbnailLink: file.thumbnailLink || "",
                    downloadLink: `https://drive.google.com/uc?export=download&id=${file.id}`,
                    mimeType: file.mimeType || "",
                    size: file.size || "0",
                    imageMediaMetadata: file.imageMediaMetadata
                        ? {
                            width: file.imageMediaMetadata.width || 0,
                            height: file.imageMediaMetadata.height || 0,
                        }
                        : undefined,
                    removed: false,
                };
            });
            const newPageToken = changes.data.newStartPageToken ||
                changes.data.nextPageToken ||
                pageToken;
            return { images, newPageToken };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to fetch image changes: ${errorMessage}`);
            throw new common_1.InternalServerErrorException("Failed to sync changes from Google Drive");
        }
    }
    async fetchImagesIncremental(folderUrl, pageToken) {
        const folderId = this.extractFolderId(folderUrl);
        if (!folderId) {
            throw new common_1.BadRequestException("Invalid Google Drive folder URL");
        }
        if (!pageToken) {
            const images = await this.fetchImagesFromFolder(folderUrl);
            const newPageToken = await this.getStartPageToken();
            return {
                images: images.map((img) => ({ ...img, removed: false })),
                newPageToken,
                isFullSync: true,
            };
        }
        const { images, newPageToken } = await this.fetchImageChanges(folderId, pageToken);
        return { images, newPageToken, isFullSync: false };
    }
    async makeFilePublic(fileId) {
        try {
            await this.drive.permissions.create({
                fileId,
                requestBody: {
                    role: "reader",
                    type: "anyone",
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Failed to make file ${fileId} public: ${errorMessage}`);
        }
    }
    getPublicThumbnailUrl(fileId, size = 400) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
    }
    getPublicImageUrl(fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    async streamFile(fileId, thumbnailSize) {
        try {
            if (thumbnailSize) {
                return await this.streamOptimizedImage(fileId, thumbnailSize);
            }
            const fileMetadata = await this.drive.files.get({
                fileId,
                fields: "mimeType, size",
            });
            const response = await this.drive.files.get({
                fileId,
                alt: "media",
            }, { responseType: "stream" });
            return {
                stream: response.data,
                mimeType: fileMetadata.data.mimeType || "image/jpeg",
                size: fileMetadata.data.size || "0",
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to stream file ${fileId}: ${errorMessage}`);
            throw new common_1.InternalServerErrorException(`Failed to stream file: ${errorMessage}`);
        }
    }
    async streamOptimizedImage(fileId, maxWidth = 800, quality = 85) {
        try {
            this.logger.log(`Optimizing image ${fileId}: max-width=${maxWidth}px, quality=${quality}%`);
            const response = await this.drive.files.get({
                fileId,
                alt: "media",
            }, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data);
            const optimizedBuffer = await (0, sharp_1.default)(buffer)
                .resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: "inside",
            })
                .jpeg({
                quality,
                progressive: true,
                mozjpeg: true,
            })
                .toBuffer();
            const stream = stream_1.Readable.from(optimizedBuffer);
            this.logger.log(`Optimized ${fileId}: ${buffer.length} -> ${optimizedBuffer.length} bytes (${Math.round((1 - optimizedBuffer.length / buffer.length) * 100)}% reduction)`);
            return {
                stream,
                mimeType: "image/jpeg",
                size: optimizedBuffer.length.toString(),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to optimize image ${fileId}: ${errorMessage}`);
            this.logger.warn(`Falling back to full-size image for ${fileId} due to optimization error`);
            return this.streamFile(fileId);
        }
    }
};
exports.GoogleDriveService = GoogleDriveService;
exports.GoogleDriveService = GoogleDriveService = GoogleDriveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleDriveService);
//# sourceMappingURL=google-drive.service.js.map