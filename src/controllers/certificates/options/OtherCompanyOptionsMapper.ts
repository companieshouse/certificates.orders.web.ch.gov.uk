import {
    CertificateItem,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { OptionsViewModel } from "./OptionsViewModel";
import { CERTIFICATE_OPTIONS } from "../../../model/template.paths";
import { CompanyStatus } from "../model/CompanyStatus";
import { AbstractOptionsMapper } from "./AbstractOptionsMapper";
import { optionFilter } from "../OptionFilter";
import { OptionSelection } from "./OptionSelection";
import { ResourceState } from "./OptionsService";
import { OtherCompanyRedirectStateMachine } from "./OtherCompanyRedirectStateMachine";

export class OtherCompanyOptionsMapper extends AbstractOptionsMapper<OtherCompanyRedirectStateMachine> {
    mapItemToOptions (item: CertificateItem): OptionsViewModel {
        return new OptionsViewModel(CERTIFICATE_OPTIONS, {
            companyNumber: item.companyNumber,
            itemOptions: item.itemOptions,
            templateName: CERTIFICATE_OPTIONS,
            SERVICE_URL: `/company/${item.companyNumber}/orderable/certificates`,
            filterMappings: {
                goodStanding: item.itemOptions.companyStatus === CompanyStatus.ACTIVE,
                liquidators: item.itemOptions.companyStatus === CompanyStatus.LIQUIDATION,
                administrators: item.itemOptions.companyStatus === CompanyStatus.ADMINISTRATION
            },
            optionFilter: optionFilter
        });
    }

    createInitialItemOptions (companyStatus: string): ItemOptionsRequest {
        const result: ItemOptionsRequest = {
            directorDetails: {
                includeBasicInformation: null,
                includeAddress: null,
                includeAppointmentDate: null,
                includeCountryOfResidence: null,
                includeDobType: null,
                includeNationality: null,
                includeOccupation: null
            },
            includeCompanyObjectsInformation: null,
            includeGoodStandingInformation: null,
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: null
            },
            secretaryDetails: {
                includeBasicInformation: null,
                includeAddress: null,
                includeAppointmentDate: null
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
        case OptionSelection.DIRECTORS: {
            itemOptionsAccum.directorDetails = { includeBasicInformation: true };
            break;
        }
        case OptionSelection.SECRETARIES: {
            itemOptionsAccum.secretaryDetails = { includeBasicInformation: true };
            break;
        }
        case OptionSelection.COMPANY_OBJECTS: {
            itemOptionsAccum.includeCompanyObjectsInformation = true;
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

    handleOption (option: string, redirectStateMachine: OtherCompanyRedirectStateMachine) {
        if (option === OptionSelection.REGISTERED_OFFICE_ADDRESS) {
            redirectStateMachine.redirectAddressDetails();
        } else if (option === OptionSelection.DIRECTORS) {
            redirectStateMachine.redirectDirectorDetails();
        } else if (option === OptionSelection.SECRETARIES) {
            redirectStateMachine.redirectSecretaryDetails();
        }
    }

    getStateMachine (resourceState: ResourceState): OtherCompanyRedirectStateMachine {
        return new OtherCompanyRedirectStateMachine(resourceState);
    }
}
