import { Request, Response, NextFunction } from "express";
import { getAccessToken, getUserId } from "../../session/helper";
import { ScudItemPostRequest, ScudItem } from "ch-sdk-node/dist/services/order/scud/types";
import { postScudItem } from "../../client/api.client";
import { SCAN_UPON_DEMAND_CHECK_DETAILS, replaceScudId } from "./../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;
        const filingHistoryId = req.params.filingHistoryId;

        const scudItemRequest: ScudItemPostRequest = {
            companyNumber,
            itemOptions: {
                filingHistoryId
            },
            quantity: 1
        };
        const userId = getUserId(req.session);
        const scudItem: ScudItem = await postScudItem(accessToken, scudItemRequest);
        logger.info(`SCUD Item created, id=${scudItem.id}, user_id=${userId}, company_number=${scudItem.companyNumber}`);
        res.redirect(replaceScudId(SCAN_UPON_DEMAND_CHECK_DETAILS, scudItem.id));
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    };
};
