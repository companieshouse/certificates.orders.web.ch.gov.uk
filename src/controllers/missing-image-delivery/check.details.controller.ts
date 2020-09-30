import { NextFunction, Request, Response } from "express";
import { MISSING_IMAGE_DELIVERY_CHECK_DETAILS } from "../../model/template.paths";
import { getAccessToken, getUserId } from "../../session/helper";
import { APPLICATION_NAME } from "../../config/config";
import { createLogger } from "ch-structured-logging";
import { MidItem } from "ch-sdk-node/dist/services/order/mid/types";
import { getMissingImageDeliveryItem } from "../../client/api.client";
import { getFullFilingHistoryDescription } from "../../config/api.enumerations";
import { replaceCompanyNumberAndFilingHistoryId, ROOT_MISSING_IMAGE_DELIVERY } from "../../model/page.urls";
import { mapFilingHistoryDescriptionValues, removeAsterisks, mapDate, addCurrencySymbol } from "../../service/map.filing.history.service";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const midID: string = req.params.missingImageDeliveryId;
        const missingImageDeliveryItem: MidItem = await getMissingImageDeliveryItem(accessToken, midID);

        const descriptionFromFile = getFullFilingHistoryDescription(missingImageDeliveryItem.itemOptions.filingHistoryDescription);
        const mappedFilingHistoryDescription = mapFilingHistoryDescriptionValues(descriptionFromFile, missingImageDeliveryItem.itemOptions.filingHistoryDescriptionValues || {});
        const cleanedFilingHistoryDescription = removeAsterisks(mappedFilingHistoryDescription);

        return res.render(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, {
            backUrl: replaceCompanyNumberAndFilingHistoryId(ROOT_MISSING_IMAGE_DELIVERY, missingImageDeliveryItem.companyNumber, missingImageDeliveryItem.itemOptions.filingHistoryId),
            serviceUrl: "test",
            companyName: missingImageDeliveryItem.companyName,
            companyNumber: missingImageDeliveryItem.companyNumber,
            filingHistoryDate: mapDate(missingImageDeliveryItem.itemOptions.filingHistoryDate),
            filingHistoryDescription: cleanedFilingHistoryDescription,
            filingHistoryType: missingImageDeliveryItem.itemOptions.filingHistoryType,
            totalCost: addCurrencySymbol(missingImageDeliveryItem.totalItemCost)
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
