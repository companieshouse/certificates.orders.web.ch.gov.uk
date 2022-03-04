import { ViewModelCreatable } from "../ViewModelCreatable";
import { LP_CERTIFICATE_CHECK_DETAILS } from "../../../model/template.paths";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_OPTIONS, LP_ROOT_CERTIFICATE,
    replaceCertificateId, replaceCompanyNumber, ROOT_DISSOLVED_CERTIFICATE
} from "../../../model/page.urls";
import { DefaultCertificateMappable } from "./DefaultCertificateMappable";

export class LPCheckDetailsFactory implements ViewModelCreatable {
    private textMapper: DefaultCertificateMappable;

    public constructor (textMapper: DefaultCertificateMappable) {
        this.textMapper = textMapper;
    }

    public createViewModel (certificateItem: CertificateItem, basket: Basket): { [key: string]: any } {
        const itemOptions = certificateItem.itemOptions;
        const changeLink = (certificateItem.itemOptions?.certificateType !== "dissolution")
            ? replaceCertificateId(LP_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id)
            : replaceCertificateId(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id);
        const serviceUrl = (certificateItem.itemOptions?.certificateType !== "dissolution")
            ? replaceCompanyNumber(LP_ROOT_CERTIFICATE, certificateItem.companyNumber)
            : replaceCompanyNumber(ROOT_DISSOLVED_CERTIFICATE, certificateItem.companyNumber);
        return {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: this.textMapper.mapCertificateType(itemOptions.certificateType),
            deliveryMethod: this.textMapper.mapDeliveryMethod(itemOptions),
            fee: this.textMapper.prependCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            changeIncludedOn: replaceCertificateId(LP_CERTIFICATE_OPTIONS, certificateItem.id),
            changeDeliveryDetails: changeLink,
            deliveryDetails: this.textMapper.mapDeliveryDetails(basket.deliveryDetails),
            SERVICE_URL: serviceUrl,
            isNotDissolutionCertificateType: itemOptions.certificateType !== "dissolution",
            templateName: LP_CERTIFICATE_CHECK_DETAILS,
            statementOfGoodStanding: this.textMapper.isOptionSelected(itemOptions.includeGoodStandingInformation),
            principalPlaceOfBusiness: this.textMapper.mapAddressOption(itemOptions.principalPlaceOfBusinessDetails?.includeAddressRecordsType),
            generalPartners: this.textMapper.isOptionSelected(itemOptions.generalPartnerDetails?.includeBasicInformation),
            limitedPartners: this.textMapper.isOptionSelected(itemOptions.limitedPartnerDetails?.includeBasicInformation),
            generalNatureOfBusiness: this.textMapper.isOptionSelected(itemOptions.includeGeneralNatureOfBusinessInformation)
        };
    };

    public getTemplate (): string {
        return LP_CERTIFICATE_CHECK_DETAILS;
    }
}
