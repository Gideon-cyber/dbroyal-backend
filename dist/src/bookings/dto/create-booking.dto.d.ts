import { ApprovalStatus, BookingStatus, Country } from "@prisma/client";
export declare class CreateBookingDto {
    title?: string;
    eventId?: string;
    clientId: string;
    dateTime: string;
    location?: string;
    approvalStatus?: ApprovalStatus;
    status?: BookingStatus;
    assignedUserIds?: string[];
    country?: Country;
}
