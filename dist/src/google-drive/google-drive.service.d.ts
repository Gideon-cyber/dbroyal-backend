import { ConfigService } from "@nestjs/config";
export declare class GoogleDriveService {
    private configService;
    private readonly logger;
    private drive;
    constructor(configService: ConfigService);
    extractFolderId(url: string): string | null;
    fetchImagesFromFolder(folderUrl: string): Promise<{
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
    }[]>;
    createShareableLinkForPhotos(photoIds: string[]): Promise<string>;
    getDownloadLink(fileId: string): Promise<string>;
    downloadMultiplePhotos(fileIds: string[]): Promise<string>;
    getFilesMetadata(fileIds: string[]): Promise<{
        id: string;
        name: string;
        mimeType: string;
        size: string;
        webViewLink: string;
        thumbnailLink: string;
        downloadLink: string;
    }[]>;
    downloadFileAsBuffer(fileId: string): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
    getStartPageToken(): Promise<string>;
    fetchImageChanges(folderId: string, pageToken: string): Promise<{
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
    }>;
    fetchImagesIncremental(folderUrl: string, pageToken?: string): Promise<{
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
    }>;
    makeFilePublic(fileId: string): Promise<void>;
    getPublicThumbnailUrl(fileId: string, size?: number): string;
    getPublicImageUrl(fileId: string): string;
    streamFile(fileId: string, thumbnailSize?: number): Promise<{
        stream: any;
        mimeType: string;
        size: string;
    }>;
    streamOptimizedImage(fileId: string, maxWidth?: number, quality?: number): Promise<{
        stream: any;
        mimeType: string;
        size: string;
    }>;
}
