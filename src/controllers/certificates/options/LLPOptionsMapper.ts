import {
    CertificateItem,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { OptionsViewModel } from "./OptionsViewModel";
import { CompanyStatus } from "../model/CompanyStatus";
import { LLP_CERTIFICATE_OPTIONS } from "../../../model/template.paths";
import { optionFilter } from "../OptionFilter";
import { LLP_ROOT_CERTIFICATE, replaceCompanyNumber } from "../../../model/page.urls";
import { AbstractOptionsMapper } from "./AbstractOptionsMapper";
import { OptionSelection } from "./OptionSelection";

export class LLPOptionsMapper extends AbstractOptionsMapper {
    mapItemToOptions (item: CertificateItem): OptionsViewModel {
        return new OptionsViewModel(LLP_CERTIFICATE_OPTIONS, {
            companyNumber: item.companyNumber,
            itemOptions: item.itemOptions,
            templateName: LLP_CERTIFICATE_OPTIONS,
            SERVICE_URL: replaceCompanyNumber(LLP_ROOT_CERTIFICATE, item.companyNumber),
            filterMappings: {
                goodStanding: item.itemOptions.companyStatus !== CompanyStatus.LIQUIDATION,
                liquidators: item.itemOptions.companyStatus === CompanyStatus.LIQUIDATION
            },
            optionFilter: optionFilter
        });
    }

    createInitialItemOptions (): ItemOptionsRequest {
        return {
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
    }

    filterItemOptions (itemOptionsAccum: ItemOptionsRequest, option: string): ItemOptionsRequest {
        switch (option) {
        case OptionSelection.STATEMENT_OF_GOOD_STANDING: {
            itemOptionsAccum.includeGoodStandingInformation = true;
            break;
        }
        case OptionSelection.REGISTERED_OFFICE_ADDRESS: {
            itemOptionsAccum.registeredOfficeAddressDetails = {};
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
        default:
            break;
        }
        return itemOptionsAccum;
    }
}
