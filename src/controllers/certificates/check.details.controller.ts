import { NextFunction, Request, Response } from "express";
import { CertificateItem, ItemOptions, DirectorOrSecretaryDetails } from "ch-sdk-node/dist/services/order/certificates/types";
import { Basket, DeliveryDetails } from "ch-sdk-node/dist/services/order/basket/types";
import { createLogger } from "ch-structured-logging";

import { CERTIFICATE_OPTIONS, CERTIFICATE_DELIVERY_DETAILS, replaceCertificateId } from "../../model/page.urls";
import { mapDeliveryDetails, mapToHtml, mapDeliveryMethod } from "../../utils/check.details.utils";
import { CERTIFICATE_CHECK_DETAILS } from "../../model/template.paths";
import { addItemToBasket, getCertificateItem, getBasket } from "../../client/api.client";
import { CHS_URL, APPLICATION_NAME } from "../../config/config";
import { getAccessToken, getUserId } from "../../session/helper";
import { setServiceUrl } from "../../utils/service.url.utils";

const GOOD_STANDING = "Statement of good standing";
const REGISTERED_OFFICE_ADDRESS = "Registered office address";
const DIRECTORS = "Directors";
const SECRETARIES = "Secretaries";
const COMPANY_OBJECTS = "Company objects";

const logger = createLogger(APPLICATION_NAME);

export const isOptionSelected = (itemOption: Boolean | undefined) : string => {
    if (itemOption === undefined) {
        return "No";
    } else {
        return "Yes";
    }
};

const setChangeDeliveryDetails = (certificateItem: CertificateItem) => {
    return (certificateItem.itemOptions?.certificateType !== "dissolution")
        ? `/orderable/certificates/${certificateItem.id}/delivery-details` : `/orderable/dissolved-certificates/${certificateItem.id}/delivery-details`;
};

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const itemOptions: ItemOptions = certificateItem.itemOptions;
        const basket: Basket = await getBasket(accessToken);
        const isNotDissolutionCertificateType: Boolean = itemOptions.certificateType !== "dissolution";
        const includeAddressRecordsType: string | undefined = itemOptions.registeredOfficeAddressDetails?.includeAddressRecordsType;

        return res.render(CERTIFICATE_CHECK_DETAILS, {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: mapCertificateType(itemOptions.certificateType),
            deliveryMethod: mapDeliveryMethod(itemOptions),
            fee: applyCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            certificateMappings: mapIncludedOnCertificate(itemOptions),
            changeIncludedOn: replaceCertificateId(CERTIFICATE_OPTIONS, req.params.certificateId),
            changeDeliveryDetails: setChangeDeliveryDetails(certificateItem),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            SERVICE_URL: setServiceUrl(certificateItem),
            isNotDissolutionCertificateType,
            templateName: CERTIFICATE_CHECK_DETAILS,
            statementOfGoodStanding: isOptionSelected(itemOptions.includeGoodStandingInformation),
            currentCompanyDirectorsNames: mapDirectorOptions(itemOptions.directorDetails),
            currentSecretariesNames: isOptionSelected(itemOptions.secretaryDetails?.includeBasicInformation),
            companyObjects: isOptionSelected(itemOptions.includeCompanyObjectsInformation),
            registeredOfficeAddress: mapRegisteredOfficeAddress(includeAddressRecordsType)
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
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
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

export const mapRegisteredOfficeAddress = (registeredOfficeAddress: string | undefined): string => {
    switch (registeredOfficeAddress) {
    case "current":
        return "Current address";
    case "current-and-previous":
        return "Current address and the one previous";
    case "current-previous-and-prior":
        return "Current address and the two previous";
    case "all":
        return "All current and previous addresses";
    default:
        return "No";
    };
};

export const mapDirectorOptions = (directorOptions: DirectorOrSecretaryDetails): string => {
    if (directorOptions === undefined || directorOptions.includeBasicInformation === undefined) {
        return "No";
    }

    if (directorOptions.includeBasicInformation === true &&
        directorOptions.includeAddress === false &&
        directorOptions.includeAppointmentDate === false &&
        directorOptions.includeCountryOfResidence === false &&
        directorOptions.includeDobType === undefined &&
        directorOptions.includeNationality === false &&
        directorOptions.includeOccupation === false) {
        return "Yes";
    }

    const mappings:string[] = [];
    mappings.push("Including directors':<br>");

    if (directorOptions.includeAddress) {
        mappings.push("Correspondence address");
    }

    if (directorOptions.includeOccupation) {
        mappings.push("Occupation");
    }

    if (directorOptions.includeDobType === "partial" ||
        directorOptions.includeDobType === "full") {
        mappings.push("Date of birth (month and year)");
    }

    if (directorOptions.includeAppointmentDate) {
        mappings.push("Appointment date");
    }

    if (directorOptions.includeNationality) {
        mappings.push("Nationality");
    }

    if (directorOptions.includeCountryOfResidence) {
        mappings.push("Country of residence");
    }

    return mapToHtml(mappings);
};

export default [route];
