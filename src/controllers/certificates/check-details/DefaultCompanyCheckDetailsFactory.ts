import { ViewModelCreatable } from "../ViewModelCreatable";
import { CERTIFICATE_CHECK_DETAILS } from "../../../model/template.paths";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { CERTIFICATE_OPTIONS, replaceCertificateId } from "../../../model/page.urls";
import { setServiceUrl } from "../../../utils/service.url.utils";
import { CompanyStatus } from "../model/CompanyStatus";
import { DefaultCompanyMappable } from "./DefaultCompanyMappable";

export class DefaultCompanyCheckDetailsFactory implements ViewModelCreatable {
    private textMapper: DefaultCompanyMappable;

    public constructor (textMapper: DefaultCompanyMappable) {
        this.textMapper = textMapper;
    }

    public createViewModel (certificateItem: CertificateItem, basket: Basket): { [key: string]: any } {
        const itemOptions = certificateItem.itemOptions;
        const changeLink = (itemOptions.certificateType !== "dissolution")
            ? `/orderable/certificates/${certificateItem.id}/delivery-details`
            : `/orderable/dissolved-certificates/${certificateItem.id}/delivery-details`;
        return {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: this.textMapper.mapCertificateType(itemOptions.certificateType),
            deliveryMethod: this.textMapper.mapDeliveryMethod(itemOptions),
            emailCopyRequired: this.textMapper.mapEmailCopyRequired(itemOptions),
            fee: this.textMapper.prependCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            changeIncludedOn: replaceCertificateId(CERTIFICATE_OPTIONS, certificateItem.id),
            changeDeliveryDetails: changeLink,
            deliveryDetails: this.textMapper.mapDeliveryDetails(basket.deliveryDetails),
            SERVICE_URL: setServiceUrl(certificateItem),
            isNotDissolutionCertificateType: itemOptions.certificateType !== "dissolution",
            templateName: CERTIFICATE_CHECK_DETAILS,
            statementOfGoodStanding: this.textMapper.isOptionSelected(itemOptions.includeGoodStandingInformation),
            currentCompanyDirectorsNames: this.textMapper.mapDirectorOptions(itemOptions.directorDetails),
            currentSecretariesNames: this.textMapper.mapSecretaryOptions(itemOptions.secretaryDetails),
            companyObjects: this.textMapper.isOptionSelected(itemOptions.includeCompanyObjectsInformation),
            registeredOfficeAddress: this.textMapper.mapAddressOption(itemOptions.registeredOfficeAddressDetails?.includeAddressRecordsType),
            liquidatorsDetails: this.textMapper.isOptionSelected(itemOptions.liquidatorsDetails?.includeBasicInformation),
            administratorsDetails: this.textMapper.isOptionSelected(itemOptions.administratorsDetails?.includeBasicInformation),
            filterMappings: {
                statementOfGoodStanding: certificateItem.itemOptions.companyStatus === CompanyStatus.ACTIVE,
                liquidators: certificateItem.itemOptions.companyStatus === CompanyStatus.LIQUIDATION,
                administrators: certificateItem.itemOptions.companyStatus === CompanyStatus.ADMINISTRATION
            }
        };
    }

    public getTemplate (): string {
        return CERTIFICATE_CHECK_DETAILS;
    }
}
