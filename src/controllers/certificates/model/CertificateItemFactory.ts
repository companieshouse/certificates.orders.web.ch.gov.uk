
import {CertificateType} from "./CertificateType";
import {CompanyStatus} from "./CompanyStatus";
import {CertificateItemPostRequest} from "@companieshouse/api-sdk-node/dist/services/order/certificates";

interface _CompanyProfile {
    companyNumber: string;
    type: string;
    companyStatus: string;
}

export default class CertificateItemFactory {
    private readonly companyProfile: _CompanyProfile;
    private readonly certificateType: string;

    constructor(companyProfile: _CompanyProfile) {
        this.companyProfile = companyProfile;
        this.certificateType = this.companyProfile.companyStatus === CompanyStatus.ACTIVE ? CertificateType.INCORPORATION : CertificateType.DISSOLUTION;
    }

    createInitialRequest = (): CertificateItemPostRequest => {

        return {
            companyNumber: this.companyProfile.companyNumber,
            itemOptions: {
                certificateType: this.certificateType,
                companyType: this.companyProfile.type,
                deliveryMethod: "postal",
                deliveryTimescale: "standard"
            },
            quantity: 1
        }
    }
}