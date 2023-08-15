import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Basket, BasketPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { createLogger } from "@companieshouse/structured-logging-node";

import { getAccessToken, getUserId } from "../../session/helper";
import { DELIVERY_DETAILS, DELIVERY_OPTIONS } from "../../model/template.paths";
import { APPLICATION_NAME } from "../../config/config";
import { getBasket, patchBasket, getCertifiedCopyItem } from "../../client/api.client";
import { deliveryDetailsValidationRules, validate } from "../../utils/delivery-details-validation";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";
import { DeliveryDetailsPropertyName } from "../certificates/model/DeliveryDetailsPropertyName";
import { mapPageHeader } from "../../utils/page.header.utils";

const escape = require("escape-html");

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
        const backLink: string = `/orderable/certified-copies/${certifiedCopyItemId}/delivery-options`;
        const SERVICE_URL = `/company/${companyNumber}/orderable/certified-copies`;
        const pageHeader = mapPageHeader(req);
        return res.render(DELIVERY_DETAILS, {
            firstName: basket.deliveryDetails?.forename,
            lastName: basket.deliveryDetails?.surname,
            companyName: basket.deliveryDetails?.companyName,
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
            pageTitleText: PAGE_TITLE,
            ...pageHeader
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
    const backLink: string = `/orderable/certified-copies/${certifiedCopyItemId}/delivery-options`;
    const errors = validationResult(req);
    const errorList = validate(errors);
    const firstName: string = req.body[DeliveryDetailsPropertyName.FIRST_NAME];
    const lastName: string = req.body[DeliveryDetailsPropertyName.LAST_NAME];
    const companyName: string = req.body[DeliveryDetailsPropertyName.COMPANY_NAME];
    const addressLineOne: string = req.body[DeliveryDetailsPropertyName.ADDRESS_LINE_ONE];
    const addressLineTwo: string = req.body[DeliveryDetailsPropertyName.ADDRESS_LINE_TWO];
    const addressTown: string = req.body[DeliveryDetailsPropertyName.ADDRESS_TOWN];
    const addressCounty: string = req.body[DeliveryDetailsPropertyName.ADDRESS_COUNTY];
    const addressPostcode: string = req.body[DeliveryDetailsPropertyName.ADDRESS_POSTCODE];
    const addressCountry: string = req.body[DeliveryDetailsPropertyName.ADDRESS_COUNTRY];
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
            companyName,
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
                companyName: companyName || null,
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
