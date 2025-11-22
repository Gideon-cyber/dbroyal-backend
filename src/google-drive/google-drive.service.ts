import { Injectable, Logger } from "@nestjs/common";
import { google, drive_v3 } from "googleapis";
import { ConfigService } from "@nestjs/config";

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
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
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
   * Fetch all image files from a Google Drive folder
   */
  async fetchImagesFromFolder(folderUrl: string): Promise<
    {
      id: string;
      name: string;
      webViewLink: string;
      thumbnailLink: string;
      downloadLink: string;
    }[]
  > {
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
    } catch (error) {
      this.logger.error(
        `Failed to fetch images from Google Drive: ${error.message}`
      );
      throw new Error(
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
          batch.map(photoId =>
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
      this.logger.error(`Failed to create shareable link: ${error.message}`);
      throw new Error("Failed to create shareable link for selected photos");
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
      this.logger.error(`Failed to generate download link: ${error.message}`);
      throw new Error("Failed to generate download link");
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
            this.logger.warn(
              `Failed to fetch metadata for file ${fileId}: ${error.message}`
            );
            return null;
          }
        })
      );

      return filesData.filter(Boolean);
    } catch (error) {
      this.logger.error(`Failed to fetch files metadata: ${error.message}`);
      throw new Error("Failed to fetch files metadata");
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
      this.logger.error(`Failed to download file ${fileId}: ${error.message}`);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }
}
