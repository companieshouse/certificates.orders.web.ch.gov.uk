import { NextFunction, Request, Response } from "express";
import { CertificateItem, ItemOptions } from "ch-sdk-node/dist/services/order/certificates/types";
import { Basket, DeliveryDetails } from "ch-sdk-node/dist/services/order/basket/types";
import { createLogger } from "ch-structured-logging";

import { CERTIFICATE_OPTIONS, CERTIFICATE_DELIVERY_DETAILS, replaceCertificateId } from "../../model/page.urls";
import { mapDeliveryDetails, mapToHtml, mapDeliveryMethod } from "../../utils/check-details-utils";
import { CERTIFICATE_CHECK_DETAILS } from "../../model/template.paths";
import { addItemToBasket, getCertificateItem, getBasket } from "../../client/api.client";
import { CHS_URL, APPLICATION_NAME } from "../../config/config";
import { getAccessToken, getUserId } from "../../session/helper";

const GOOD_STANDING = "Statement of good standing";
const REGISTERED_OFFICE_ADDRESS = "Registered office address";
const DIRECTORS = "Directors";
const SECRETARIES = "Secretaries";
const COMPANY_OBJECTS = "Company objects";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const itemOptions: ItemOptions = certificateItem.itemOptions;
        const basket: Basket = await getBasket(accessToken);

        return res.render(CERTIFICATE_CHECK_DETAILS, {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: mapCertificateType(itemOptions.certificateType),
            deliveryMethod: mapDeliveryMethod(itemOptions),
            fee: applyCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            certificateMappings: mapIncludedOnCertificate(itemOptions),
            changeIncludedOn: replaceCertificateId(CERTIFICATE_OPTIONS, req.params.certificateId),
            changedeliveryDetails: replaceCertificateId(CERTIFICATE_DELIVERY_DETAILS, req.params.certificateId),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            templateName: CERTIFICATE_CHECK_DETAILS
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
            { itemUri: `/orderable/certificates/${certificateId}` });
        logger.info(`item added to basket certificate_id=${certificateId}, user_id=${userId}, company_number=${resp.companyNumber}, redirecting to basket`);
        res.redirect(`${CHS_URL}/basket`);
    } catch (error) {
        logger.error(`error=${error}`);
        return next(error);
    }
};

export const mapIncludedOnCertificate = (itemOptions: ItemOptions): string => {
    const mappings:string[] = [];

    if (itemOptions?.includeGoodStandingInformation) {
        mappings.push(GOOD_STANDING);
    }

    if (itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType !== undefined) {
        mappings.push(REGISTERED_OFFICE_ADDRESS);
    }

    if (itemOptions?.directorDetails?.includeBasicInformation) {
        mappings.push(DIRECTORS);
    }

    if (itemOptions?.secretaryDetails?.includeBasicInformation) {
        mappings.push(SECRETARIES);
    }

    if (itemOptions?.includeCompanyObjectsInformation) {
        mappings.push(COMPANY_OBJECTS);
    }

    return mapToHtml(mappings);
};

export const mapCertificateType = (certificateType: string): string => {
    if (certificateType === "incorporation-with-all-name-changes") {
        return "Incorporation with all company name changes";
    }

    const typeCapitalised = certificateType.charAt(0).toUpperCase() +
    certificateType.slice(1);

    return typeCapitalised.replace(/-/g, " ");
};

export const applyCurrencySymbol = (fee: string): string => {
    return "£" + fee;
};

export default [route];
