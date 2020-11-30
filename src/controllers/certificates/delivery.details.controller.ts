import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CertificateItem, CertificateItemPatchRequest } from "ch-sdk-node/dist/services/order/certificates/types";
import { Basket, BasketPatchRequest } from "ch-sdk-node/dist/services/order/basket/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { getCertificateItem, patchCertificateItem, getBasket, patchBasket } from "../../client/api.client";
import { DELIVERY_DETAILS, CERTIFICATE_CHECK_DETAILS } from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { deliveryDetailsValidationRules, validate } from "../../utils/delivery-details-validation";
import { setServiceUrl } from "../../utils/service.url.utils";

const FIRST_NAME_FIELD: string = "firstName";
const LAST_NAME_FIELD: string = "lastName";
const ADDRESS_LINE_ONE_FIELD: string = "addressLineOne";
const ADDRESS_LINE_TWO_FIELD: string = "addressLineTwo";
const ADDRESS_TOWN_FIELD: string = "addressTown";
const ADDRESS_COUNTY_FIELD: string = "addressCounty";
const ADDRESS_POSTCODE_FIELD: string = "addressPostcode";
const ADDRESS_COUNTRY_FIELD: string = "addressCountry";
let backLink;

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const basket: Basket = await getBasket(accessToken);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        return res.render(DELIVERY_DETAILS, {
            firstName: basket.deliveryDetails?.forename,
            lastName: basket.deliveryDetails?.surname,
            addressLineOne: basket.deliveryDetails?.addressLine1,
            addressLineTwo: basket.deliveryDetails?.addressLine2,
            addressCountry: basket.deliveryDetails?.country,
            addressTown: basket.deliveryDetails?.locality,
            addressPoBox: basket.deliveryDetails?.poBox,
            addressPostcode: basket.deliveryDetails?.postalCode,
            addressCounty: basket.deliveryDetails?.region,
            companyNumber: certificateItem.companyNumber,
            templateName: DELIVERY_DETAILS,
            SERVICE_URL: setServiceUrl(certificateItem),
            backLink: setBackLink(certificateItem)
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const errorList = validate(errors);
    const firstName: string = req.body[FIRST_NAME_FIELD];
    const lastName: string = req.body[LAST_NAME_FIELD];
    const addressLineOne: string = req.body[ADDRESS_LINE_ONE_FIELD];
    const addressLineTwo: string = req.body[ADDRESS_LINE_TWO_FIELD];
    const addressTown: string = req.body[ADDRESS_TOWN_FIELD];
    const addressCounty: string = req.body[ADDRESS_COUNTY_FIELD];
    const addressPostcode: string = req.body[ADDRESS_POSTCODE_FIELD];
    const addressCountry: string = req.body[ADDRESS_COUNTRY_FIELD];

    if (!errors.isEmpty()) {
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);

        return res.render(DELIVERY_DETAILS, {
            ...errorList,
            addressCountry,
            addressCounty,
            addressLineOne,
            addressLineTwo,
            addressPostcode,
            addressTown,
            companyNumber: certificateItem.companyNumber,
            firstName,
            lastName,
            templateName: (DELIVERY_DETAILS),
            SERVICE_URL: setServiceUrl(certificateItem),
            backLink: setBackLink(certificateItem)
        });
    }
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                forename: firstName,
                surname: lastName
            }
        };
        const basketDeliveryDetails: BasketPatchRequest = {
            deliveryDetails: {
                addressLine1: addressLineOne,
                addressLine2: addressLineTwo || null,
                country: addressCountry,
                forename: firstName,
                locality: addressTown,
                postalCode: addressPostcode || null,
                region: addressCounty || null,
                surname: lastName
            }
        };
        const certificatePatchResponse = await patchCertificateItem(
            accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with delivery details, id=${req.params.certificateId}, user_id=${userId}, company_number=${certificatePatchResponse.companyNumber}`);
        await patchBasket(accessToken, basketDeliveryDetails);
        logger.info(`Patched basket with delivery details, certificate_id=${req.params.certificateId}, user_id=${userId}, company_number=${certificatePatchResponse.companyNumber}`);
        return res.redirect("check-details");
    } catch (err) {
        logger.error(`${err}`);
        return next(err);
    }
};

export const setBackLink = (certificateItem: CertificateItem) => {
    if (certificateItem.itemOptions?.certificateType === "dissolution") {
        backLink = `/company/${certificateItem.companyNumber}/orderable/dissolved-certificates`;
    } else if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        backLink = "registered-office-options";
    } else {
        backLink = "certificate-options";
    }
    return backLink;
};

export default [...deliveryDetailsValidationRules, route];
