import { DeliveryStatus } from "./update-download-status.dto";
export declare class ListDownloadRequestsDto {
    status?: DeliveryStatus;
    eventId?: string;
    startDate?: string;
    endDate?: string;
}
