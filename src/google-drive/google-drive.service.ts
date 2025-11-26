import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { google, drive_v3 } from "googleapis";
import { ConfigService } from "@nestjs/config";
import sharp from "sharp";
import { Readable } from "stream";

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive: drive_v3.Drive;

  constructor(private configService: ConfigService) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.configService.get<string>(
          "GOOGLE_SERVICE_ACCOUNT_EMAIL"
        ),
        private_key: this.configService
          .get<string>("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")
          ?.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    this.drive = google.drive({ version: "v3", auth });
  }

  /**
   * Extract folder ID from Google Drive URL
   * Supports formats:
   * - https://drive.google.com/drive/folders/{folderId}
   * - https://drive.google.com/drive/u/0/folders/{folderId}
   */
  extractFolderId(url: string): string | null {
    const patterns = [/\/folders\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Fetch all image files from a Google Drive folder with metadata
   */
  async fetchImagesFromFolder(folderUrl: string): Promise<
    {
      id: string;
      name: string;
      webViewLink: string;
      thumbnailLink: string;
      downloadLink: string;
      mimeType: string;
      size: string;
      imageMediaMetadata?: {
        width: number;
        height: number;
      };
    }[]
  > {
    const folderId = this.extractFolderId(folderUrl);

    if (!folderId) {
      throw new BadRequestException("Invalid Google Drive folder URL");
    }

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
        fields:
          "files(id, name, webViewLink, thumbnailLink, webContentLink, mimeType, size, imageMediaMetadata)",
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to fetch images from Google Drive: ${errorMessage}`
      );
      throw new InternalServerErrorException(
        "Failed to fetch images from Google Drive. Ensure the folder is shared with the service account."
      );
    }
  }

  /**
   * Generate a shareable link for selected photos
   * Creates a new folder with only the selected photos
   */
  async createShareableLinkForPhotos(photoIds: string[]): Promise<string> {
    try {
      // Create a new folder
      const folderMetadata: drive_v3.Schema$File = {
        name: `Selected Photos - ${new Date().toISOString()}`,
        mimeType: "application/vnd.google-apps.folder",
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: "id, webViewLink",
      });

      const folderId = folder.data.id;

      // Copy selected files to the new folder in batches to avoid rate limits
      const BATCH_SIZE = 5;
      for (let i = 0; i < photoIds.length; i += BATCH_SIZE) {
        const batch = photoIds.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map((photoId) =>
            this.drive.files.copy({
              fileId: photoId,
              requestBody: {
                parents: [folderId],
              },
            })
          )
        );
      }

      // Make folder publicly accessible
      await this.drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      return (
        folder.data.webViewLink ||
        `https://drive.google.com/drive/folders/${folderId}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create shareable link: ${errorMessage}`);
      throw new InternalServerErrorException(
        "Failed to create shareable link for selected photos"
      );
    }
  }

  /**
   * Get direct download link for a photo
   */
  async getDownloadLink(fileId: string): Promise<string> {
    try {
      // Generate a direct download link
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate download link: ${errorMessage}`);
      throw new InternalServerErrorException(
        "Failed to generate download link"
      );
    }
  }

  /**
   * Download multiple photos as a zip (creates a shared folder)
   */
  async downloadMultiplePhotos(fileIds: string[]): Promise<string> {
    return this.createShareableLinkForPhotos(fileIds);
  }

  /**
   * Get file metadata for multiple files
   */
  async getFilesMetadata(fileIds: string[]) {
    try {
      const filesData = await Promise.all(
        fileIds.map(async (fileId) => {
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
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            this.logger.warn(
              `Failed to fetch metadata for file ${fileId}: ${errorMessage}`
            );
            return null;
          }
        })
      );

      return filesData.filter(Boolean);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch files metadata: ${errorMessage}`);
      throw new InternalServerErrorException("Failed to fetch files metadata");
    }
  }

  /**
   * Download file content as buffer (useful for ZIP creation)
   */
  async downloadFileAsBuffer(
    fileId: string
  ): Promise<{ buffer: Buffer; filename: string }> {
    try {
      const file = await this.drive.files.get({
        fileId,
        fields: "name",
      });

      const response = await this.drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "arraybuffer" }
      );

      return {
        buffer: Buffer.from(response.data as ArrayBuffer),
        filename: file.data.name || `file-${fileId}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to download file ${fileId}: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Failed to download file: ${errorMessage}`
      );
    }
  }

  /**
   * Get the initial page token for a folder to track changes
   * This token can be used to fetch only new/modified files
   */
  async getStartPageToken(): Promise<string> {
    try {
      const response = await this.drive.changes.getStartPageToken({
        supportsAllDrives: false,
      });

      return response.data.startPageToken || "";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get start page token: ${errorMessage}`);
      throw new InternalServerErrorException(
        "Failed to initialize change tracking"
      );
    }
  }

  /**
   * Fetch changes since the last page token
   * Returns new/modified images and the new page token
   */
  async fetchImageChanges(
    folderId: string,
    pageToken: string
  ): Promise<{
    images: {
      id: string;
      name: string;
      webViewLink: string;
      thumbnailLink: string;
      downloadLink: string;
      mimeType: string;
      size: string;
      imageMediaMetadata?: {
        width: number;
        height: number;
      };
      removed?: boolean;
    }[];
    newPageToken: string;
  }> {
    try {
      const changes = await this.drive.changes.list({
        pageToken,
        spaces: "drive",
        fields:
          "nextPageToken, newStartPageToken, changes(fileId, removed, file(id, name, webViewLink, thumbnailLink, mimeType, size, imageMediaMetadata, parents))",
      });

      const relevantChanges =
        changes.data.changes?.filter((change) => {
          if (!change.file) return false;
          // Check if file is in the target folder and is an image
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

      const newPageToken =
        changes.data.newStartPageToken ||
        changes.data.nextPageToken ||
        pageToken;

      return { images, newPageToken };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch image changes: ${errorMessage}`);
      throw new InternalServerErrorException(
        "Failed to sync changes from Google Drive"
      );
    }
  }

  /**
   * Fetch images incrementally using change token
   * If no token provided, fetches all images and returns a new token
   */
  async fetchImagesIncremental(
    folderUrl: string,
    pageToken?: string
  ): Promise<{
    images: {
      id: string;
      name: string;
      webViewLink: string;
      thumbnailLink: string;
      downloadLink: string;
      mimeType: string;
      size: string;
      imageMediaMetadata?: {
        width: number;
        height: number;
      };
      removed?: boolean;
    }[];
    newPageToken: string;
    isFullSync: boolean;
  }> {
    const folderId = this.extractFolderId(folderUrl);

    if (!folderId) {
      throw new BadRequestException("Invalid Google Drive folder URL");
    }

    // If no page token, do full sync and get initial token
    if (!pageToken) {
      const images = await this.fetchImagesFromFolder(folderUrl);
      const newPageToken = await this.getStartPageToken();
      return {
        images: images.map((img) => ({ ...img, removed: false })),
        newPageToken,
        isFullSync: true,
      };
    }

    // Otherwise, fetch only changes
    const { images, newPageToken } = await this.fetchImageChanges(
      folderId,
      pageToken
    );
    return { images, newPageToken, isFullSync: false };
  }

  /**
   * Make a file publicly readable
   * This allows the file to be accessed via direct URL without authentication
   */
  async makeFilePublic(fileId: string): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to make file ${fileId} public: ${errorMessage}`);
      // Don't throw - file might already be public or we might not have permission
    }
  }

  /**
   * Get a publicly accessible thumbnail URL
   * Returns a URL that can be accessed directly from the browser
   */
  getPublicThumbnailUrl(fileId: string, size: number = 400): string {
    // Use Google Drive's public thumbnail endpoint
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  }

  /**
   * Get a publicly accessible image URL
   * This URL can be used directly in <img> tags
   */
  getPublicImageUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  /**
   * Stream file content for proxy serving
   * Returns a readable stream that can be piped to the response
   * @param fileId - Google Drive file ID
   * @param thumbnailSize - Optional width for image optimization (e.g., 400, 800, 1200)
   */
  async streamFile(
    fileId: string,
    thumbnailSize?: number
  ): Promise<{
    stream: any;
    mimeType: string;
    size: string;
  }> {
    try {
      // If size specified, use optimization
      if (thumbnailSize) {
        return await this.streamOptimizedImage(fileId, thumbnailSize);
      }

      // Full-size image (original behavior)
      const fileMetadata = await this.drive.files.get({
        fileId,
        fields: "mimeType, size",
      });

      const response = await this.drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );

      return {
        stream: response.data,
        mimeType: fileMetadata.data.mimeType || "image/jpeg",
        size: fileMetadata.data.size || "0",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to stream file ${fileId}: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Failed to stream file: ${errorMessage}`
      );
    }
  }

  /**
   * Stream optimized/resized image for faster web display
   * Downloads from Drive, resizes with Sharp, and streams back
   * @param fileId - Google Drive file ID
   * @param maxWidth - Maximum width in pixels (default: 800)
   * @param quality - JPEG quality 1-100 (default: 85)
   */
  async streamOptimizedImage(
    fileId: string,
    maxWidth: number = 800,
    quality: number = 85
  ): Promise<{
    stream: any;
    mimeType: string;
    size: string;
  }> {
    try {
      this.logger.log(
        `Optimizing image ${fileId}: max-width=${maxWidth}px, quality=${quality}%`
      );

      // Download file from Google Drive
      const response = await this.drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "arraybuffer" }
      );

      const buffer = Buffer.from(response.data as ArrayBuffer);

      // Resize and optimize with Sharp
      const optimizedBuffer = await sharp(buffer)
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

      // Convert buffer to stream
      const stream = Readable.from(optimizedBuffer);

      this.logger.log(
        `Optimized ${fileId}: ${buffer.length} -> ${optimizedBuffer.length} bytes (${Math.round((1 - optimizedBuffer.length / buffer.length) * 100)}% reduction)`
      );

      return {
        stream,
        mimeType: "image/jpeg",
        size: optimizedBuffer.length.toString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to optimize image ${fileId}: ${errorMessage}`);

      // Fallback to full-size if optimization fails
      this.logger.warn(
        `Falling back to full-size image for ${fileId} due to optimization error`
      );
      return this.streamFile(fileId);
    }
  }
}
