import { NextFunction, Request, Response } from "express";
import { createLogger } from "ch-structured-logging";
import { CertifiedCopyItem, FilingHistoryDocuments } from "ch-sdk-node/dist/services/certified-copies";
import { Basket } from "ch-sdk-node/dist/services/order/basket";

import { CERTIFIED_COPY_DELIVERY_DETAILS, replaceCertifiedCopyId } from "../../model/page.urls";
import { CERTIFIED_COPY_CHECK_DETAILS } from "../../model/template.paths";
import { getAccessToken, getUserId } from "../../session/helper";
import { APPLICATION_NAME } from "../../config/config";
import { getCertifiedCopyItem, getBasket } from "../../client/api.client";
import { mapDeliveryDetails, mapDeliveryMethod } from "../../utils/check-details-utils";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certifiedCopyItem: CertifiedCopyItem = await getCertifiedCopyItem(accessToken, req.params.certifiedCopyId);
        const basket: Basket = await getBasket(accessToken);

        console.log(certifiedCopyItem.itemOptions.filingHistoryDocuments);

        res.render(CERTIFIED_COPY_CHECK_DETAILS, {
            backUrl: replaceCertifiedCopyId(CERTIFIED_COPY_DELIVERY_DETAILS, req.params.certifiedCopyId),
            companyNumber: certifiedCopyItem.companyNumber,
            deliveryMethod: mapDeliveryMethod(certifiedCopyItem.itemOptions),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            filingHistoryDocuments: mapFilingHistoriesDocuments(certifiedCopyItem.itemOptions.filingHistoryDocuments)
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export const mapFilingHistoriesDocuments = (filingHistoryDocuments: FilingHistoryDocuments[]) => {
    const mappedFilingHistories = filingHistoryDocuments.map(filingHistoryDocument => {
        return {
            filingHistoryDate: filingHistoryDocument.filingHistoryDate,
            filingHistoryDescription: filingHistoryDocument.filingHistoryDescription,
            filingHistoryId: filingHistoryDocument.filingHistoryId,
            filingHistoryType: filingHistoryDocument.filingHistoryType
        };
    });

    return mappedFilingHistories;
};

export default [render];
