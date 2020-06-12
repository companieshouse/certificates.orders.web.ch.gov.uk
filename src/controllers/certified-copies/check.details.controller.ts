import { getAccessToken, getUserId } from "../../session/helper";
import { NextFunction, Request, Response } from "express";
import { addItemToBasket, getCertificateItem, getBasket } from "../../client/api.client";
import { CHS_URL, APPLICATION_NAME } from "../../config/config";
import { CertificateItem, ItemOptions } from "ch-sdk-node/dist/services/order/item/certificate/types";
import { CHECK_DETAILS } from "../../model/template.paths";

import { CERTIFIFIED_COPY_DELIVERY_DETAILS, replaceCertificateId } from "../../model/page.urls";
import { Basket, DeliveryDetails } from "ch-sdk-node/dist/services/order/basket/types";
import { createLogger } from "ch-structured-logging";

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

        return res.render(CHECK_DETAILS, {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: mapCertificateType(itemOptions.certificateType),
            deliveryMethod: mapDeliveryMethod(itemOptions),
            fee: applyCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            certificateMappings: mapIncludedOnCertificate(itemOptions),
            // changedeliveryDetails: replaceCertificateId(DELIVERY_DETAILS, req.params.certificateId),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            templateName: CHECK_DETAILS
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

export const mapDeliveryDetails = (deliveryDetails: DeliveryDetails | undefined): string => {
    const mappings:string[] = [];

    if (deliveryDetails === undefined) {
        return "";
    }

    mappings.push(deliveryDetails.forename + " " + deliveryDetails.surname);
    mappings.push(deliveryDetails.addressLine1);

    if (deliveryDetails.addressLine2 !== "" && deliveryDetails.addressLine2 !== undefined) {
        mappings.push(deliveryDetails.addressLine2);
    }

    mappings.push(deliveryDetails.locality);

    if (deliveryDetails.region !== "" && deliveryDetails.region !== undefined) {
        mappings.push(deliveryDetails.region);
    }

    if (deliveryDetails.postalCode !== "" && deliveryDetails.postalCode !== undefined) {
        mappings.push(deliveryDetails.postalCode);
    }

    mappings.push(deliveryDetails.country);

    return mapToHtml(mappings);
};

export const mapDeliveryMethod = (itemOptions: Record<string, any>): string | null => {
    if (itemOptions?.deliveryTimescale === "standard") {
        return "Standard delivery (dispatched within 4 working days)";
    }
    if (itemOptions?.deliveryTimescale === "same-day") {
        return "Same Day";
    }
    return null;
};

export const mapToHtml = (mappings: string[]): string => {
    let htmlString: string = "";

    mappings.forEach((element) => {
        htmlString += element + "<br>";
    });
    return htmlString;
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
