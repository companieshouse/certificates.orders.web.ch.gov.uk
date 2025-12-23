import {
    CertificateItem,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { OptionsViewModel } from "./OptionsViewModel";
import { CompanyStatus } from "../model/CompanyStatus";
import { LLP_CERTIFICATE_OPTIONS } from "../../../model/template.paths";
import { optionFilter } from "../OptionFilter";
import {
    replaceCompanyNumber,
    ROOT_CERTIFICATE
} from "../../../model/page.urls";
import { AbstractOptionsMapper } from "./AbstractOptionsMapper";
import { OptionSelection } from "./OptionSelection";
import { LLPRedirectStateMachine } from "./LLPRedirectStateMachine";
import { ResourceState } from "./OptionsService";

export class LLPOptionsMapper extends AbstractOptionsMapper<LLPRedirectStateMachine> {
    mapItemToOptions (item: CertificateItem): OptionsViewModel {
        return new OptionsViewModel(LLP_CERTIFICATE_OPTIONS, {
            companyNumber: item.companyNumber,
            itemOptions: item.itemOptions,
            templateName: LLP_CERTIFICATE_OPTIONS,
            SERVICE_URL: replaceCompanyNumber(ROOT_CERTIFICATE, item.companyNumber),
            filterMappings: {
                goodStanding: item.itemOptions.companyStatus === CompanyStatus.ACTIVE,
                liquidators: item.itemOptions.companyStatus === CompanyStatus.LIQUIDATION,
                administrators: item.itemOptions.companyStatus === CompanyStatus.ADMINISTRATION
            },
            optionFilter
        });
    }

    createInitialItemOptions (companyStatus: string): ItemOptionsRequest {
        const result: ItemOptionsRequest = {
            designatedMemberDetails: {
                includeAddress: null,
                includeAppointmentDate: null,
                includeBasicInformation: null,
                includeCountryOfResidence: null,
                includeDobType: null
            },
            includeCompanyObjectsInformation: null,
            includeGoodStandingInformation: null,
            memberDetails: {
                includeAddress: null,
                includeAppointmentDate: null,
                includeBasicInformation: null,
                includeCountryOfResidence: null,
                includeDobType: null
            },
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: null
            }
        };
        if (companyStatus === CompanyStatus.LIQUIDATION) {
            result.liquidatorsDetails = { includeBasicInformation: null };
        } else if (companyStatus === CompanyStatus.ADMINISTRATION) {
            result.administratorsDetails = { includeBasicInformation: null };
        }
        return result;
    }

    filterItemOptions (itemOptionsAccum: ItemOptionsRequest, option: string): ItemOptionsRequest {
        switch (option) {
        case OptionSelection.STATEMENT_OF_GOOD_STANDING: {
            itemOptionsAccum.includeGoodStandingInformation = true;
            break;
        }
        case OptionSelection.REGISTERED_OFFICE_ADDRESS: {
            itemOptionsAccum.registeredOfficeAddressDetails = { includeAddressRecordsType: "current" };
            break;
        }
        case OptionSelection.DESIGNATED_MEMBERS: {
            itemOptionsAccum.designatedMemberDetails = { includeBasicInformation: true };
            break;
        }
        case OptionSelection.MEMBERS: {
            itemOptionsAccum.memberDetails = { includeBasicInformation: true };
            break;
        }
        case OptionSelection.LIQUIDATORS_DETAILS: {
            itemOptionsAccum.liquidatorsDetails = { includeBasicInformation: true };
            break;
        }
        case OptionSelection.ADMINISTRATORS_DETAILS: {
            itemOptionsAccum.administratorsDetails = { includeBasicInformation: true };
            break;
        }
        default:
            break;
        }
        return itemOptionsAccum;
    }

    handleOption (option: string, redirectStateMachine: LLPRedirectStateMachine): void {
        if (option === OptionSelection.REGISTERED_OFFICE_ADDRESS) {
            redirectStateMachine.redirectAddressDetails();
        } else if (option === OptionSelection.DESIGNATED_MEMBERS) {
            redirectStateMachine.redirectDesignatedMemberDetails();
        } else if (option === OptionSelection.MEMBERS) {
            redirectStateMachine.redirectMemberDetails();
        }
    }

    getStateMachine (resourceState: ResourceState): LLPRedirectStateMachine {
        return new LLPRedirectStateMachine(resourceState);
    }
}
