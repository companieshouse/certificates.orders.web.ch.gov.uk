import {CertificateItemPostRequest} from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import {CompanyStatusHelper} from "../llp-certificates/CompanyStatusHelper";

interface _CompanyProfile {
    companyNumber: string;
    companyStatus: string;
    type: string;
}

export default class CertificateItemFactory {
    constructor(private companyProfile: _CompanyProfile, private companyStatusHelper: CompanyStatusHelper = new CompanyStatusHelper()) {
    }

    createInitialRequest = (): CertificateItemPostRequest => {

        const certificateType = this.companyStatusHelper.certificateTypeByCompanyStatus(this.companyProfile.companyStatus);
        if (!certificateType) {
            throw Error(`No certificate type for company status: ${this.companyProfile.companyStatus}`);
        }

        return {
            companyNumber: this.companyProfile.companyNumber,
            itemOptions: {
                deliveryMethod: "postal",
                deliveryTimescale: "standard"
            },
            quantity: 1
        }
    }
}