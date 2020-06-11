export const ROOT: string = "/company/:companyNumber/orderable/certificates";
export const ROOT_CERTIFICATE: string = "/orderable/certificates/:certificateId";

export const CERTIFICATE_TYPE: string = ROOT + "/certificate-type";

export const CERTIFICATE_OPTIONS: string = ROOT_CERTIFICATE + "/certificate-options";
export const DELIVERY_DETAILS: string = ROOT_CERTIFICATE + "/delivery-details";
export const CHECK_DETAILS: string = ROOT_CERTIFICATE + "/check-details";

export const replaceCompanyNumber = (uri: string, companyNumber: string) => {
    return uri.replace(":companyNumber", companyNumber);
};

export const replaceCertificateId = (uri: string, certificateId: string) => {
    return uri.replace(":certificateId", certificateId);
};
