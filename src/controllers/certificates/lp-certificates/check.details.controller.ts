import {NextFunction, Request, Response} from "express";
import {
    CertificateItem,
    ItemOptions,
    DirectorOrSecretaryDetails, GeneralPartnerDetails, LimitedPartnerDetails
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {Basket} from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {createLogger} from "ch-structured-logging";

import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_OPTIONS, LP_ROOT_CERTIFICATE,
    LP_ROOT_CERTIFICATE_ID,
    replaceCertificateId,
    replaceCompanyNumber, ROOT_DISSOLVED_CERTIFICATE
} from "../../../model/page.urls";
import {mapDeliveryDetails, mapToHtml, mapDeliveryMethod} from "../../../utils/check.details.utils";
import {LP_CERTIFICATE_CHECK_DETAILS} from "../../../model/template.paths";
import {addItemToBasket, getCertificateItem, getBasket} from "../../../client/api.client";
import {CHS_URL, APPLICATION_NAME} from "../../../config/config";
import {getAccessToken, getUserId} from "../../../session/helper";
import {AddressRecordsType} from "../../../model/AddressRecordsType";

const logger = createLogger(APPLICATION_NAME);

export const isOptionSelected = (itemOption: Boolean | undefined): string => itemOption === undefined ? "No" : "Yes";

const setChangeDeliveryDetails = (certificateItem: CertificateItem) => {
    return (certificateItem.itemOptions?.certificateType !== "dissolution")
        ? replaceCertificateId(LP_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id) : replaceCertificateId(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id);
};

const setServiceUrl = (certificateItem: CertificateItem) => {
    return (certificateItem.itemOptions?.certificateType !== "dissolution")
        ? replaceCompanyNumber(LP_ROOT_CERTIFICATE, certificateItem.companyNumber) : replaceCompanyNumber(ROOT_DISSOLVED_CERTIFICATE, certificateItem.companyNumber);
}

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const itemOptions: ItemOptions = certificateItem.itemOptions;
        const basket: Basket = await getBasket(accessToken);
        const isNotDissolutionCertificateType: Boolean = itemOptions.certificateType !== "dissolution";
        const includeAddressRecordsType: string | undefined = itemOptions.principlePlaceOfBusinessDetails?.includeAddressRecordsType;

        return res.render(LP_CERTIFICATE_CHECK_DETAILS, {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: mapCertificateType(itemOptions.certificateType),
            deliveryMethod: mapDeliveryMethod(itemOptions),
            fee: applyCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            changeIncludedOn: replaceCertificateId(LP_CERTIFICATE_OPTIONS, req.params.certificateId),
            changeDeliveryDetails: setChangeDeliveryDetails(certificateItem),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            SERVICE_URL: setServiceUrl(certificateItem),
            isNotDissolutionCertificateType,
            templateName: LP_CERTIFICATE_CHECK_DETAILS,
            statementOfGoodStanding: isOptionSelected(itemOptions.includeGoodStandingInformation),
            principlePlaceOfBusiness: mapPlaceOfBusinessAddress(includeAddressRecordsType),
            generalPartners: isOptionSelected(itemOptions.generalPartnerDetails?.includeBasicInformation),
            limitedPartners: isOptionSelected(itemOptions.limitedPartnerDetails?.includeBasicInformation),
            generalNatureOfBusiness: isOptionSelected(itemOptions.includeGeneralNatureOfBusinessInformation)
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    // add item to basket
    // then redirect
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateId: string = req.params.certificateId;
        const userId = getUserId(req.session);
        const resp = await addItemToBasket(
            accessToken,
            {itemUri: `/orderable/certificates/${certificateId}`});
        logger.info(`item added to basket certificate_id=${certificateId}, user_id=${userId}, company_number=${resp.companyNumber}, redirecting to basket`);
        res.redirect(`${CHS_URL}/basket`);
    } catch (error) {
        logger.error(`error=${error}`);
        return next(error);
    }
};

export const mapCertificateType = (certificateType: string): string => {
    if (certificateType === "incorporation-with-all-name-changes") {
        return "Incorporation with all company name changes";
    } else if (certificateType === "dissolution") {
        return "Dissolution with all company name changes";
    }

    const typeCapitalised = certificateType.charAt(0).toUpperCase() +
        certificateType.slice(1);

    return typeCapitalised.replace(/-/g, " ");
};

export const applyCurrencySymbol = (fee: string): string => {
    return "£" + fee;
};

export const mapPlaceOfBusinessAddress = (placeOfBusinessAddress: string | undefined): string => {
    switch (placeOfBusinessAddress) {
        case AddressRecordsType.CURRENT:
            return "Current address";
        case AddressRecordsType.CURRENT_AND_PREVIOUS:
            return "Current address and the one previous";
        case AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR:
            return "Current address and the two previous";
        case AddressRecordsType.ALL:
            return "All current and previous addresses";
        default:
            return "No";
    }
};

export default [route];
