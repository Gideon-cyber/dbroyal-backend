import { Response } from "express";
import { EventsService } from "./events.service";
import { GoogleDriveService } from "../google-drive/google-drive.service";
import { Country } from "@prisma/client";
export declare class DownloadController {
    private readonly eventsService;
    private readonly googleDriveService;
    constructor(eventsService: EventsService, googleDriveService: GoogleDriveService);
    getDownloadSelection(country: Country, token: string): Promise<{
        event: {
            id: string;
            name: string;
        };
        images: {
            id: string;
            downloadLink: string;
            viewLink: string;
        }[];
        createdAt: Date;
        expiresAt: Date;
    }>;
    downloadAsZip(country: Country, token: string, res: Response): Promise<void>;
}
