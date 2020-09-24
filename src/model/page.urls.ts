// Certificate section:

export const ROOT_CERTIFICATE: string = "/company/:companyNumber/orderable/certificates";
export const ROOT_CERTIFICATE_ID: string = "/orderable/certificates/:certificateId";

export const CERTIFICATE_TYPE: string = ROOT_CERTIFICATE + "/certificate-type";

export const CERTIFICATE_OPTIONS: string = ROOT_CERTIFICATE_ID + "/certificate-options";
export const CERTIFICATE_DELIVERY_DETAILS: string = ROOT_CERTIFICATE_ID + "/delivery-details";
export const CERTIFICATE_CHECK_DETAILS: string = ROOT_CERTIFICATE_ID + "/check-details";

// Certified copy section:

export const ROOT_CERTIFIED_COPY: string = "/company/:companyNumber/orderable/certified-copies";
export const ROOT_CERTIFIED_COPY_ID: string = "/orderable/certified-copies/:certifiedCopyId";

export const CERTIFIED_COPY_FILING_HISTORY: string = "/company/:companyNumber/certified-documents";

export const CERTIFIED_COPY_DELIVERY_DETAILS: string = ROOT_CERTIFIED_COPY_ID + "/delivery-details";
export const CERTIFIED_COPY_CHECK_DETAILS: string = ROOT_CERTIFIED_COPY_ID + "/check-details";

// Missing image delivery section
export const ROOT_MISSING_IMAGE_DELIVERY: string = "/company/:companyNumber/orderable/missing-image-delivery/:filingHistoryId";
export const ROOT_MISSING_IMAGE_DELIVERY_ID: string = "/orderable/missing-image-delivery/:missingImageDeliveryId";

export const MISSING_IMAGE_DELIVERY_CREATE: string = ROOT_MISSING_IMAGE_DELIVERY + "/create";
export const MISSING_IMAGE_DELIVERY_CHECK_DETAILS: string = ROOT_MISSING_IMAGE_DELIVERY_ID + "/check-details";

export const replaceCompanyNumber = (uri: string, companyNumber: string) => {
    return uri.replace(":companyNumber", companyNumber);
};

export const replaceCertificateId = (uri: string, certificateId: string) => {
    return uri.replace(":certificateId", certificateId);
};

export const replaceCertifiedCopyId = (uri: string, certifiedCopyId: string) => {
    return uri.replace(":certifiedCopyId", certifiedCopyId);
};

export const replaceCompanyNumberAndFilingHistoryId = (uri: string, companyNumber: string, filingHistoryId: string) => {
    return uri.replace(":companyNumber", companyNumber).replace(":filingHistoryId", filingHistoryId);
};

export const replaceMissingImageDeliveryId = (uri: string, missingImageDeliveryId: string) => {
    return uri.replace(":missingImageDeliveryId", missingImageDeliveryId);
};
