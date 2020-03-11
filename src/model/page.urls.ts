export const ROOT: string = "/company/:companyNumber/orderable/certificates";
export const GOOD_STANDING: string = ROOT + "/good-standing";
export const ORDER_DETAILS: string = ROOT + "/order-details";
export const COLLECTION: string =  ROOT + "/collection";
export const CHECK_DETAILS: string = ROOT + "/check-details";

export const replaceCompanyNumber = (uri: string, companyNumber: string) => {
    return uri.replace(":companyNumber", companyNumber );
};
