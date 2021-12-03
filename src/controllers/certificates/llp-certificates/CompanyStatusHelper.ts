import {CompanyStatus} from "../model/CompanyStatus";
import {FEATURE_FLAGS} from "../../../config/FeatureFlags";
import {CertificateType} from "../model/CertificateType";

export class CompanyStatusHelper {
    private readonly certificateTypes = {
        [CompanyStatus.ACTIVE]: CertificateType.INCORPORATION,
        [CompanyStatus.LIQUIDATION]: CertificateType.INCORPORATION,
        [CompanyStatus.DISSOLVED]: CertificateType.DISSOLUTION
    }

    constructor(private redirectPaths: { [key: string]: string } = {}) {
    }

    public certificateTypeByCompanyStatus = (companyStatus: string): string => {
        return this.certificateTypes[companyStatus];
    }

    public companyStatusValid = (companyStatus: string): boolean => {
        return this.validCompanyStatuses()[companyStatus];
    }

    public redirectPathByCompanyStatus = (companyStatus: string): string => {
        return this.redirectPaths[companyStatus];
    }

    private validCompanyStatuses = (): { [key: string]: boolean } => {
        return {
            [CompanyStatus.ACTIVE]: true,
            [CompanyStatus.DISSOLVED]: true,
            [CompanyStatus.LIQUIDATION]: FEATURE_FLAGS.liquidatedCompanyCertficiateEnabled
        }
    }
}

