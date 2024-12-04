import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import {
    CertificateItem,
    CertificateItemPatchRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { BasketPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { getAccessToken, getUserId } from "../../../session/helper";
import { getCertificateItem, patchCertificateItem, patchBasket } from "../../../client/api.client";
import { DELIVERY_DETAILS } from "../../../model/template.paths";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../../config/config";
import { deliveryDetailsValidationRules, validate } from "../../../utils/delivery-details-validation";
import { setServiceUrl } from "../../../utils/service.url.utils";
import { renderNonBasketJourneyDeliveryDetails, setBackLink } from "../../../service/delivery.details.service";
import { DeliveryDetailsPropertyName } from "../model/DeliveryDetailsPropertyName";

const PAGE_TITLE: string = "Delivery details - Order a certificate - GOV.UK";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    renderNonBasketJourneyDeliveryDetails(req, res, next, PAGE_TITLE);
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const errorList = validate(errors);
    const companyName: string = req.body[DeliveryDetailsPropertyName.COMPANY_NAME];
    const firstName: string = req.body[DeliveryDetailsPropertyName.FIRST_NAME];
    const lastName: string = req.body[DeliveryDetailsPropertyName.LAST_NAME];
    const addressLineOne: string = req.body[DeliveryDetailsPropertyName.ADDRESS_LINE_ONE];
    const addressLineTwo: string = req.body[DeliveryDetailsPropertyName.ADDRESS_LINE_TWO];
    const addressTown: string = req.body[DeliveryDetailsPropertyName.ADDRESS_TOWN];
    const addressCounty: string = req.body[DeliveryDetailsPropertyName.ADDRESS_COUNTY];
    const addressPostcode: string = req.body[DeliveryDetailsPropertyName.ADDRESS_POSTCODE];
    const addressCountry: string = req.body[DeliveryDetailsPropertyName.ADDRESS_COUNTRY];

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
            companyName,
            firstName,
            lastName,
            pageTitle: PAGE_TITLE,
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
                deliveryMethod: "postal",
                forename: firstName,
                surname: lastName
            }
        };
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

export default [...deliveryDetailsValidationRules, route];
