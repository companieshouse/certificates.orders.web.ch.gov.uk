import { ViewModelCreatable } from "../ViewModelCreatable";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_OPTIONS, LLP_ROOT_CERTIFICATE,
    replaceCertificateId, replaceCompanyNumber, ROOT_DISSOLVED_CERTIFICATE
} from "../../../model/page.urls";
import { CompanyStatus } from "../model/CompanyStatus";
import { LLPCompanyMappable } from "./LLPCompanyMappable";

export class LLPCheckDetailsFactory implements ViewModelCreatable {
    private textMapper: LLPCompanyMappable;
    private template: string;

    public constructor (textMapper: LLPCompanyMappable, template: string) {
        this.textMapper = textMapper;
        this.template = template;
    }

    public createViewModel (certificateItem: CertificateItem, basket: Basket): { [key: string]: any } {
        const itemOptions = certificateItem.itemOptions;
        const multiItemBasketEnabled = basket.enrolled;
        const changeLink = (certificateItem.itemOptions?.certificateType !== "dissolution")
            ? replaceCertificateId(LLP_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id)
            : replaceCertificateId(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id);
        const serviceUrl = (certificateItem.itemOptions?.certificateType !== "dissolution")
            ? replaceCompanyNumber(LLP_ROOT_CERTIFICATE, certificateItem.companyNumber)
            : replaceCompanyNumber(ROOT_DISSOLVED_CERTIFICATE, certificateItem.companyNumber);
        return {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: this.textMapper.mapCertificateType(itemOptions.certificateType),
            deliveryMethod: this.textMapper.mapDeliveryMethod(itemOptions, multiItemBasketEnabled),
            emailCopyRequired: this.textMapper.mapEmailCopyRequired(itemOptions),
            fee: this.textMapper.prependCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            changeIncludedOn: replaceCertificateId(LLP_CERTIFICATE_OPTIONS, certificateItem.id),
            changeDeliveryDetails: changeLink,
            deliveryDetails: this.textMapper.mapDeliveryDetails(basket.deliveryDetails),
            SERVICE_URL: serviceUrl,
            isNotDissolutionCertificateType: itemOptions.certificateType !== "dissolution",
            templateName: this.template,
            statementOfGoodStanding: this.textMapper.isOptionSelected(itemOptions.includeGoodStandingInformation),
            currentDesignatedMembersNames: this.textMapper.mapMembersOptions("Including designated members':", itemOptions.designatedMemberDetails),
            currentMembersNames: this.textMapper.mapMembersOptions("Including members':", itemOptions.memberDetails),
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
        return this.template;
    }
}
