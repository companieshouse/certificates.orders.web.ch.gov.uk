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

export class OtherCompanyOptionsMapper extends AbstractOptionsMapper {
    mapItemToOptions (item: CertificateItem): OptionsViewModel {
        return new OptionsViewModel(CERTIFICATE_OPTIONS, {
            companyNumber: item.companyNumber,
            itemOptions: item.itemOptions,
            templateName: CERTIFICATE_OPTIONS,
            SERVICE_URL: `/company/${item.companyNumber}/orderable/certificates`,
            filterMappings: {
                goodStanding: item.itemOptions.companyStatus !== CompanyStatus.LIQUIDATION,
                liquidators: item.itemOptions.companyStatus === CompanyStatus.LIQUIDATION
            },
            optionFilter: optionFilter
        });
    }

    createInitialItemOptions (): ItemOptionsRequest {
        return {
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
        } as ItemOptionsRequest;
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
        default:
            break;
        }
        return itemOptionsAccum;
    }
}
