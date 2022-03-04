import {
    MemberDetails
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { DefaultCertificateMappable } from "./DefaultCertificateMappable";

export interface LLPCompanyMappable extends DefaultCertificateMappable {
    mapMembersOptions (heading: string, memberOptions?: MemberDetails): string
}
