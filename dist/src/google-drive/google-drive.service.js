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
            scopes: ["https://www.googleapis.com/auth/drive.readonly"],
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
            throw new Error("Invalid Google Drive folder URL");
        }
        try {
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and (mimeType contains 'image/')`,
                fields: "files(id, name, webViewLink, thumbnailLink, webContentLink)",
                pageSize: 1000,
            });
            const files = response.data.files || [];
            return files.map((file) => ({
                id: file.id || "",
                name: file.name || "",
                webViewLink: file.webViewLink || "",
                thumbnailLink: file.thumbnailLink || "",
                downloadLink: `https://drive.google.com/uc?export=download&id=${file.id}`,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to fetch images from Google Drive: ${error.message}`);
            throw new Error("Failed to fetch images from Google Drive. Ensure the folder is shared with the service account.");
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
                await Promise.all(batch.map(photoId => this.drive.files.copy({
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
            this.logger.error(`Failed to create shareable link: ${error.message}`);
            throw new Error("Failed to create shareable link for selected photos");
        }
    }
    async getDownloadLink(fileId) {
        try {
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
        catch (error) {
            this.logger.error(`Failed to generate download link: ${error.message}`);
            throw new Error("Failed to generate download link");
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
                    this.logger.warn(`Failed to fetch metadata for file ${fileId}: ${error.message}`);
                    return null;
                }
            }));
            return filesData.filter(Boolean);
        }
        catch (error) {
            this.logger.error(`Failed to fetch files metadata: ${error.message}`);
            throw new Error("Failed to fetch files metadata");
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
            this.logger.error(`Failed to download file ${fileId}: ${error.message}`);
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }
};
exports.GoogleDriveService = GoogleDriveService;
exports.GoogleDriveService = GoogleDriveService = GoogleDriveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleDriveService);
//# sourceMappingURL=google-drive.service.js.map