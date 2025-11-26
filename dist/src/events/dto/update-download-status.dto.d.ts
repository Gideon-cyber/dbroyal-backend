export declare enum DeliveryStatus {
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    PROCESSING_DELIVERY = "PROCESSING_DELIVERY",
    SHIPPED = "SHIPPED",
    REJECTED = "REJECTED"
}
export declare class UpdateDownloadStatusDto {
    status: DeliveryStatus;
    rejectionReason?: string;
    approvedBy?: string;
}
