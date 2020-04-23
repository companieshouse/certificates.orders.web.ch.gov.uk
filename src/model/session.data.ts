export const APPLICATION_DATA_KEY = "certificates.orders.web.ch.gov.uk";

export interface CertificateData {
    id?: string;
    companyNumber?: string;
}
export interface ApplicationData {
    certificate?: CertificateData;
}
