import {
    CertificateItem,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { OptionsViewModel } from "./OptionsViewModel";
import { LP_CERTIFICATE_OPTIONS } from "../../../model/template.paths";
import { AbstractOptionsMapper } from "./AbstractOptionsMapper";
import { replaceCompanyNumber, ROOT_CERTIFICATE } from "../../../model/page.urls";
import { OptionSelection } from "./OptionSelection";
import { LPRedirectStateMachine } from "./LPRedirectStateMachine";
import { ResourceState } from "./OptionsService";

export class LPOptionsMapper extends AbstractOptionsMapper<LPRedirectStateMachine> {
    mapItemToOptions (item: CertificateItem): OptionsViewModel {
        return new OptionsViewModel(LP_CERTIFICATE_OPTIONS, {
            companyNumber: item.companyNumber,
            itemOptions: item.itemOptions,
            templateName: LP_CERTIFICATE_OPTIONS,
            SERVICE_URL: replaceCompanyNumber(ROOT_CERTIFICATE, item.companyNumber)
        });
    }

    createInitialItemOptions (companyStatus: string): ItemOptionsRequest {
        return {
            generalPartnerDetails: {
                includeBasicInformation: null
            },
            includeCompanyObjectsInformation: null,
            includeGoodStandingInformation: null,
            limitedPartnerDetails: {
                includeBasicInformation: null
            },
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: null
            },
            includeGeneralNatureOfBusinessInformation: null
        };
    }

    filterItemOptions (itemOptionsAccum: ItemOptionsRequest, option: string): ItemOptionsRequest {
        switch (option) {
        case OptionSelection.STATEMENT_OF_GOOD_STANDING: {
            itemOptionsAccum.includeGoodStandingInformation = true;
            break;
        }
        case OptionSelection.PRINCIPAL_PLACE_OF_BUSINESS: {
            itemOptionsAccum.principalPlaceOfBusinessDetails = { includeAddressRecordsType: "current" };
            break;
        }
        case OptionSelection.GENERAL_PARTNERS: {
            itemOptionsAccum.generalPartnerDetails = { includeBasicInformation: true };
            break;
        }
        case OptionSelection.LIMITED_PARTNERS: {
            itemOptionsAccum.limitedPartnerDetails = { includeBasicInformation: true };
            break;
        }
        case OptionSelection.GENERAL_NATURE_OF_BUSINESS: {
            itemOptionsAccum.includeGeneralNatureOfBusinessInformation = true;
            break;
        }
        default:
            break;
        }
        return itemOptionsAccum;
    }

    handleOption (option: string, redirectStateMachine: LPRedirectStateMachine): void {
        if (option === OptionSelection.PRINCIPAL_PLACE_OF_BUSINESS) {
            redirectStateMachine.redirectAddressDetails();
        }
    }

    getStateMachine (resourceState: ResourceState): LPRedirectStateMachine {
        return new LPRedirectStateMachine(resourceState);
    }
}
