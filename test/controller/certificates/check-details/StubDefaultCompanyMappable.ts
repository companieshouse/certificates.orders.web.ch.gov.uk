import { DefaultCompanyMappable } from "../../../../src/controllers/certificates/check-details/DefaultCompanyMappable";
import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {
    DirectorOrSecretaryDetails,
    MemberDetails
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { LLPCompanyMappable } from "../../../../src/controllers/certificates/check-details/LLPCompanyMappable";

export const MAPPED_OPTION_VALUE = "Option value";
export const MAPPED_ADDRESS_OPTION = "Address option";
export const MAPPED_CERTIFICATE_TYPE = "Certificate type";
export const MAPPED_DELIVERY_DETAILS = "Delivery details";
export const MAPPED_DELIVERY_METHOD = "Delivery method";
export const MAPPED_FEE = "Mapped fee";
export const MAPPED_DIRECTOR_OPTIONS = "Director options";
export const MAPPED_SECRETARY_OPTIONS = "Secretary options";
export const MAPPED_MEMBER_OPTIONS = "Member options";
export const MAPPED_EMAIL_COPY_REQUIRED = "Yes";

export class StubDefaultCompanyMappable implements DefaultCompanyMappable, LLPCompanyMappable {
    isOptionSelected (itemOption: Boolean | undefined): string {
        return MAPPED_OPTION_VALUE;
    }

    mapAddressOption (addressOption: string | undefined): string {
        return MAPPED_ADDRESS_OPTION;
    }

    mapCertificateType (certificateType: string): string {
        return MAPPED_CERTIFICATE_TYPE;
    }

    mapDeliveryDetails (deliveryDetails: DeliveryDetails | undefined): string {
        return MAPPED_DELIVERY_DETAILS;
    }

    mapDeliveryMethod (itemOptions: Record<string, any>): string | null {
        return MAPPED_DELIVERY_METHOD;
    }

    prependCurrencySymbol (fee: string): string {
        return MAPPED_FEE;
    }

    mapDirectorOptions (directorOptions?: DirectorOrSecretaryDetails): string {
        return MAPPED_DIRECTOR_OPTIONS;
    }

    mapSecretaryOptions (secretaryOptions?: DirectorOrSecretaryDetails): string {
        return MAPPED_SECRETARY_OPTIONS;
    }

    mapMembersOptions (heading: string, memberOptions?: MemberDetails): string {
        return MAPPED_MEMBER_OPTIONS;
    }

    mapEmailCopyRequired (itemOptions: Record<string, any>): string {
        return MAPPED_EMAIL_COPY_REQUIRED;
    }
}
