import { ViewModelCreatable } from "../ViewModelCreatable";
import { LLP_CERTIFICATE_CHECK_DETAILS } from "../../../model/template.paths";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_OPTIONS, LLP_ROOT_CERTIFICATE,
    replaceCertificateId, replaceCompanyNumber, ROOT_DISSOLVED_CERTIFICATE
} from "../../../model/page.urls";
import { setServiceUrl } from "../../../utils/service.url.utils";
import { CompanyStatus } from "../model/CompanyStatus";
import { LLPCompanyMappable } from "./LLPCompanyMappable";

export class LLPCheckDetailsFactory implements ViewModelCreatable {
    private textMapper: LLPCompanyMappable;

    public constructor (textMapper: LLPCompanyMappable) {
        this.textMapper = textMapper;
    }

    public createViewModel (certificateItem: CertificateItem, basket: Basket): { [key: string]: any } {
        const itemOptions = certificateItem.itemOptions;
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
            deliveryMethod: this.textMapper.mapDeliveryMethod(itemOptions),
            fee: this.textMapper.prependCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            changeIncludedOn: replaceCertificateId(LLP_CERTIFICATE_OPTIONS, certificateItem.id),
            changeDeliveryDetails: changeLink,
            deliveryDetails: this.textMapper.mapDeliveryDetails(basket.deliveryDetails),
            SERVICE_URL: serviceUrl,
            isNotDissolutionCertificateType: itemOptions.certificateType !== "dissolution",
            templateName: LLP_CERTIFICATE_CHECK_DETAILS,
            statementOfGoodStanding: this.textMapper.isOptionSelected(itemOptions.includeGoodStandingInformation),
            currentDesignatedMembersNames: this.textMapper.mapMembersOptions("Including designated members':", itemOptions.designatedMemberDetails),
            currentMembersNames: this.textMapper.mapMembersOptions("Including members':", itemOptions.memberDetails),
            registeredOfficeAddress: this.textMapper.mapAddressOption(itemOptions.registeredOfficeAddressDetails?.includeAddressRecordsType),
            liquidatorsDetails: this.textMapper.isOptionSelected(itemOptions.liquidatorsDetails?.includeBasicInformation),
            filterMappings: {
                statementOfGoodStanding: certificateItem.itemOptions.companyStatus !== CompanyStatus.LIQUIDATION,
                liquidators: certificateItem.itemOptions.companyStatus === CompanyStatus.LIQUIDATION
            }
        };
    }

    public getTemplate (): string {
        return LLP_CERTIFICATE_CHECK_DETAILS;
    }
}
