import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { NextFunction, Request, Response } from "express";
import { setServiceUrl } from "../utils/service.url.utils";
import { getAccessToken, getUserId } from "../session/helper";
import { getCertificateItem, getBasket } from "../client/api.client";
import { ADDITIONAL_COPIES, DELIVERY_DETAILS, DELIVERY_OPTIONS } from "../model/template.paths";
import { mapPageHeader } from "../utils/page.header.utils";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../config/config";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

const logger = createLogger(APPLICATION_NAME);
export const renderNonBasketJourneyDeliveryDetails = async (req: Request, res: Response, next: NextFunction, pageTitle: string) => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const basket: Basket = await getBasket(accessToken);
        const pageHeader = mapPageHeader(req);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

        return res.render(DELIVERY_DETAILS, {
            companyName: basket.deliveryDetails?.companyName,
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
            pageTitleText: pageTitle,
            SERVICE_URL: setServiceUrl(certificateItem),
            backLink: setBackLink(certificateItem),
            ...pageHeader
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export const setBackLink = (certificateItem: CertificateItem):string => {
    if (certificateItem.itemOptions?.deliveryTimescale === "same-day") {
        return ADDITIONAL_COPIES;
    }
    return DELIVERY_OPTIONS;
};
