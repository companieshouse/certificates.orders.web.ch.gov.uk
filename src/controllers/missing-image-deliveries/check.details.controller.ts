import { NextFunction, Request, Response } from "express";
import { MISSING_IMAGE_DELIVERY_CHECK_DETAILS } from "../../model/template.paths";
import { getAccessToken, getUserId } from "../../session/helper";
import { APPLICATION_NAME, CHS_URL } from "../../config/config";
import { createLogger } from "ch-structured-logging";
import { MidItem } from "@companieshouse/api-sdk-node/dist/services/order/mid/types";
import { getMissingImageDeliveryItem, addItemToBasket, getBasket, appendItemToBasket } from "../../client/api.client";
import { getFullFilingHistoryDescription } from "../../config/api.enumerations";
import { replaceCompanyNumberAndFilingHistoryId, ROOT_MISSING_IMAGE_DELIVERY } from "../../model/page.urls";
import { mapFilingHistoryDescriptionValues, removeAsterisks, mapDate, addCurrencySymbol } from "../../service/map.filing.history.service";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const midID: string = req.params.missingImageDeliveryId;
        const missingImageDeliveryItem: MidItem = await getMissingImageDeliveryItem(accessToken, midID);
        const basket: Basket = await getBasket(accessToken);
        const SERVICE_URL = `/company/${missingImageDeliveryItem.companyNumber}/filing-history`;

        const descriptionFromFile = getFullFilingHistoryDescription(missingImageDeliveryItem.itemOptions.filingHistoryDescription);
        const mappedFilingHistoryDescription = mapFilingHistoryDescriptionValues(descriptionFromFile, missingImageDeliveryItem.itemOptions.filingHistoryDescriptionValues || {});
        const cleanedFilingHistoryDescription = removeAsterisks(mappedFilingHistoryDescription);

        return res.render(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, {
            backUrl: replaceCompanyNumberAndFilingHistoryId(ROOT_MISSING_IMAGE_DELIVERY, missingImageDeliveryItem.companyNumber, missingImageDeliveryItem.itemOptions.filingHistoryId),
            SERVICE_URL,
            companyName: missingImageDeliveryItem.companyName,
            companyNumber: missingImageDeliveryItem.companyNumber,
            filingHistoryDate: mapDate(missingImageDeliveryItem.itemOptions.filingHistoryDate),
            filingHistoryDescription: cleanedFilingHistoryDescription,
            filingHistoryType: missingImageDeliveryItem.itemOptions.filingHistoryType,
            totalCost: addCurrencySymbol(missingImageDeliveryItem.totalItemCost),
            enrolled: basket.enrolled
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const missingImageDeliveryId: string = req.params.missingImageDeliveryId;
        const userId = getUserId(req.session);

        const basket: Basket = await getBasket(accessToken);

        let resp;
        if (basket.enrolled) {
            resp = await appendItemToBasket(
                accessToken,
                { itemUri: `/orderable/missing-image-deliveries/${missingImageDeliveryId}` });
            logger.info(`User enrolled in multi item baske. Item appended to basket missing_image_delivery_id=${missingImageDeliveryId}, user_id=${userId}, company_number=${resp.companyNumber}, redirecting to basket`);
        } else {
            resp = await addItemToBasket(
                accessToken,
                { itemUri: `/orderable/missing-image-deliveries/${missingImageDeliveryId}` });
            logger.info(`item added to basket missing_image_delivery_id=${missingImageDeliveryId}, user_id=${userId}, company_number=${resp.companyNumber}, redirecting to basket`);
        }
        res.redirect(`${CHS_URL}/basket`);
    } catch (error) {
        logger.error(`error=${error}`);
        return next(error);
    }
};

export default [route];
