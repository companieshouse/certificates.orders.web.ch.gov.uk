export const ROOT: string = "/company/:companyNumber/orderable/certificates";
export const CERTIFICATE_OPTIONS: string = ROOT + "/certificate-options";
export const DELIVERY_DETAILS: string = ROOT + "/delivery-details";
export const CHECK_DETAILS: string = ROOT + "/check-details";

export const replaceCompanyNumber = (uri: string, companyNumber: string) => {
    return uri.replace(":companyNumber", companyNumber );
};
