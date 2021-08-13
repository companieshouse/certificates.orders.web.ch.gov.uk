import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Basket, BasketPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { createLogger } from "ch-structured-logging";

import { getAccessToken, getUserId } from "../../session/helper";
import { DELIVERY_DETAILS } from "../../model/template.paths";
import { APPLICATION_NAME } from "../../config/config";
import { getBasket, patchBasket, getCertifiedCopyItem } from "../../client/api.client";
import { deliveryDetailsValidationRules, validate } from "../../utils/delivery-details-validation";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";
const escape = require("escape-html");

const FIRST_NAME_FIELD: string = "firstName";
const LAST_NAME_FIELD: string = "lastName";
const ADDRESS_LINE_ONE_FIELD: string = "addressLineOne";
const ADDRESS_LINE_TWO_FIELD: string = "addressLineTwo";
const ADDRESS_TOWN_FIELD: string = "addressTown";
const ADDRESS_COUNTY_FIELD: string = "addressCounty";
const ADDRESS_POSTCODE_FIELD: string = "addressPostcode";
const ADDRESS_COUNTRY_FIELD: string = "addressCountry";
const PAGE_TITLE: string = "Delivery details - Order a certified document - GOV.UK";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const basket: Basket = await getBasket(accessToken);
        logger.info(`Get basket, user_id=${userId}`);
        const certifiedCopyItemId:string = req.params.certifiedCopyId;
        const certifiedCopyItem:CertifiedCopyItem = await getCertifiedCopyItem(accessToken, certifiedCopyItemId);
        const companyNumber:string = certifiedCopyItem.companyNumber;
        const backLink: string = `/company/${companyNumber}/certified-documents`;
        const SERVICE_URL = `/company/${companyNumber}/orderable/certified-copies`;
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
            backLink,
            SERVICE_URL,
            companyNumber,
            templateName: DELIVERY_DETAILS,
            pageTitleText: PAGE_TITLE
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken: string = getAccessToken(req.session);
    const certifiedCopyItemId = req.params.certifiedCopyId;
    const certifiedCopyItem = await getCertifiedCopyItem(accessToken, certifiedCopyItemId);
    const companyNumber = certifiedCopyItem.companyNumber;
    const backLink: string = `/company/${companyNumber}/certified-documents`;
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
    const SERVICE_URL = `/company/${companyNumber}/orderable/certified-copies`;

    if (!errors.isEmpty()) {
        return res.render(DELIVERY_DETAILS, {
            ...errorList,
            addressCountry,
            addressCounty,
            addressLineOne,
            addressLineTwo,
            addressPostcode,
            addressTown,
            firstName,
            lastName,
            backLink,
            companyNumber,
            pageTitleText: PAGE_TITLE,
            templateName: (DELIVERY_DETAILS),
            SERVICE_URL
        });
    }
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
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
        logger.info(`Patched basket with delivery details, certified_copy_id=${req.params.certifiedCopyId}, user_id=${userId}`);
        await patchBasket(accessToken, basketDeliveryDetails);
        return res.redirect("check-details");
    } catch (err) {
        next(err);
    }
};

export default [...deliveryDetailsValidationRules, route];
