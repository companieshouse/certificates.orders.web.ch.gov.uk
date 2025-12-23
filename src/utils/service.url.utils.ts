import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

export const setServiceUrl = (certificateItem: CertificateItem) => {
    return (certificateItem.itemOptions?.certificateType !== "dissolution")
        ? `/company/${certificateItem.companyNumber}/orderable/certificates`
        : `/company/${certificateItem.companyNumber}/orderable/dissolved-certificates`;
};
