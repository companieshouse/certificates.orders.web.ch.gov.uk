import { Request, Response, NextFunction } from "express";
import { getAccessToken, getUserId } from "../../session/helper";
import { postMissingImageDeliveryItem } from "../../client/api.client";
import { ROOT_MISSING_IMAGE_DELIVERY_BASKET_ERROR, MISSING_IMAGE_DELIVERY_CHECK_DETAILS, replaceCompanyNumberAndFilingHistoryId, replaceMissingImageDeliveryId } from "../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { MidItem, MidItemPostRequest } from "@companieshouse/api-sdk-node/dist/services/order/mid/types";
import { BasketLink } from "../../model/BasketLink";
import { BasketLimit, BasketLimitState } from "../../model/BasketLimit";
import { getBasketLimit, getBasketLink } from "../../utils/basket.utils";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;
        const filingHistoryId = req.params.filingHistoryId;

        const basketLink: BasketLink = await getBasketLink(req);
        const basketLimit: BasketLimit = getBasketLimit(basketLink);

        if (basketLimit.basketLimitState == BasketLimitState.BELOW_LIMIT) {
            const missingImageDeliveryItemRequest: MidItemPostRequest = {
                companyNumber,
                itemOptions: {
                    filingHistoryId
                },
                quantity: 1
            };
            const userId = getUserId(req.session);
            const missingImageDeliveryItem: MidItem = await postMissingImageDeliveryItem(accessToken, missingImageDeliveryItemRequest);
            logger.info(`Missing Image Delivery Item created, id=${missingImageDeliveryItem.id}, user_id=${userId}, company_number=${missingImageDeliveryItem.companyNumber}`);
            res.redirect(replaceMissingImageDeliveryId(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, missingImageDeliveryItem.id));
        } else {
            res.redirect(replaceCompanyNumberAndFilingHistoryId(ROOT_MISSING_IMAGE_DELIVERY_BASKET_ERROR, companyNumber,filingHistoryId));
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    };
};
