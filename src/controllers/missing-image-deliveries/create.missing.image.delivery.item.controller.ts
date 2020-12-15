import { Request, Response, NextFunction } from "express";
import { getAccessToken, getUserId } from "../../session/helper";
import { postMissingImageDeliveryItem } from "../../client/api.client";
import { MISSING_IMAGE_DELIVERY_CHECK_DETAILS, replaceMissingImageDeliveryId } from "../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { MidItem, MidItemPostRequest } from "@companieshouse/api-sdk-node/dist/services/order/mid/types";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;
        const filingHistoryId = req.params.filingHistoryId;

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
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    };
};
