// Certificate section:

import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../config/config";

export const ROOT_CERTIFICATE: string = "/company/:companyNumber/orderable/certificates";
export const ROOT_CERTIFICATE_ID: string = "/orderable/certificates/:certificateId";

export const ROOT_DISSOLVED_CERTIFICATE: string = "/company/:companyNumber/orderable/dissolved-certificates";
export const ROOT_DISSOLVED_CERTIFICATE_ID: string = "/orderable/dissolved-certificates/:certificateId";

export const CERTIFICATE_TYPE: string = ROOT_CERTIFICATE + "/certificate-type";
export const DISSOLVED_CERTIFICATE_TYPE: string = ROOT_DISSOLVED_CERTIFICATE + "/certificate-type";

export const CERTIFICATE_OPTIONS: string = ROOT_CERTIFICATE_ID + "/certificate-options";
export const CERTIFICATE_DELIVERY_DETAILS: string = ROOT_CERTIFICATE_ID + "/delivery-details";
export const CERTIFICATE_CHECK_DETAILS: string = ROOT_CERTIFICATE_ID + "/check-details";
export const CERTIFICATE_REGISTERED_OFFICE_OPTIONS: string = ROOT_CERTIFICATE_ID + "/registered-office-options";
export const CERTIFICATE_DIRECTOR_OPTIONS: string = ROOT_CERTIFICATE_ID + "/director-options";
export const CERTIFICATE_SECRETARY_OPTIONS: string = ROOT_CERTIFICATE_ID + "/secretary-options";

export const LP_ROOT_CERTIFICATE: string = "/company/:companyNumber/orderable/lp-certificates";
export const LP_ROOT_CERTIFICATE_ID: string = "/orderable/lp-certificates/:certificateId";
export const LP_CERTIFICATE_TYPE: string = LP_ROOT_CERTIFICATE + "/certificate-type";
export const LP_CERTIFICATE_OPTIONS: string = LP_ROOT_CERTIFICATE_ID + "/certificate-options";
export const LP_CERTIFICATE_PRINCIPLE_PLACE_OPTIONS: string = LP_ROOT_CERTIFICATE_ID + "/principle-place-of-business-options";

export const LLP_ROOT_CERTIFICATE: string = "/company/:companyNumber/orderable/llp-certificates";
export const LLP_ROOT_CERTIFICATE_ID: string = "/orderable/llp-certificates/:certificateId";
export const LLP_CERTIFICATE_OPTIONS: string = LLP_ROOT_CERTIFICATE_ID + "/certificate-options";
export const LLP_CERTIFICATE_TYPE: string = LLP_ROOT_CERTIFICATE + "/certificate-type";
export const LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS: string = LLP_ROOT_CERTIFICATE_ID + "/designated-members-options";
export const LLP_CERTIFICATE_MEMBERS_OPTIONS: string = LLP_ROOT_CERTIFICATE_ID + "/members-options";

export const DISSOLVED_CERTIFICATE_OPTIONS: string = ROOT_DISSOLVED_CERTIFICATE_ID + "/certificate-options";
export const DISSOLVED_CERTIFICATE_DELIVERY_DETAILS: string = ROOT_DISSOLVED_CERTIFICATE_ID + "/delivery-details";
export const DISSOLVED_CERTIFICATE_CHECK_DETAILS: string = ROOT_DISSOLVED_CERTIFICATE_ID + "/check-details";

// Certified copy section:

export const ROOT_CERTIFIED_COPY: string = "/company/:companyNumber/orderable/certified-copies";
export const ROOT_CERTIFIED_COPY_ID: string = "/orderable/certified-copies/:certifiedCopyId";

export const CERTIFIED_COPY_FILING_HISTORY: string = "/company/:companyNumber/certified-documents";

export const CERTIFIED_COPY_DELIVERY_DETAILS: string = ROOT_CERTIFIED_COPY_ID + "/delivery-details";
export const CERTIFIED_COPY_CHECK_DETAILS: string = ROOT_CERTIFIED_COPY_ID + "/check-details";

// Missing image delivery section
export const ROOT_MISSING_IMAGE_DELIVERY: string = "/company/:companyNumber/orderable/missing-image-deliveries/:filingHistoryId";
export const ROOT_MISSING_IMAGE_DELIVERY_ID: string = "/orderable/missing-image-deliveries/:missingImageDeliveryId";

export const MISSING_IMAGE_DELIVERY_CREATE: string = ROOT_MISSING_IMAGE_DELIVERY + "/create";
export const MISSING_IMAGE_DELIVERY_CHECK_DETAILS: string = ROOT_MISSING_IMAGE_DELIVERY_ID + "/check-details";

const logger = createLogger(APPLICATION_NAME);

export const replaceCompanyNumber = (uri: string, companyNumber: string) => {
    logger.debug(`Replacing Company Number, uri=${uri}, company_number=${companyNumber}`);
    return uri.replace(":companyNumber", companyNumber);
};

export const replaceCertificateId = (uri: string, certificateId: string) => {
    logger.debug(`Replacing Certificate Id, uri=${uri}, certificate_id=${certificateId}`);
    return uri.replace(":certificateId", certificateId);
};

export const replaceCertifiedCopyId = (uri: string, certifiedCopyId: string) => {
    logger.debug(`Replacing Certified Copy Id, uri=${uri}, certified_copy_id=${certifiedCopyId}`);
    return uri.replace(":certifiedCopyId", certifiedCopyId);
};

export const replaceCompanyNumberAndFilingHistoryId = (uri: string, companyNumber: string, filingHistoryId: string) => {
    logger.debug(`Replacing Company Number and Filing History Id, uri=${uri}, company_number=${companyNumber}, filing_history_id=${filingHistoryId}`);
    return uri.replace(":companyNumber", companyNumber).replace(":filingHistoryId", filingHistoryId);
};

export const replaceMissingImageDeliveryId = (uri: string, missingImageDeliveryId: string) => {
    logger.debug(`Replacing Missing Image Delivery Id, uri=${uri}, missing_image_delivery_id=${missingImageDeliveryId}`);
    return uri.replace(":missingImageDeliveryId", missingImageDeliveryId);
};
