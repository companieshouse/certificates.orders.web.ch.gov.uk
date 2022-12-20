import { NextFunction, Request, Response } from "express";
import { createLogger } from "ch-structured-logging";
import { CertifiedCopyItem, FilingHistoryDocuments } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";

import { CERTIFIED_COPY_DELIVERY_DETAILS, replaceCertifiedCopyId } from "../../model/page.urls";
import { CERTIFIED_COPY_CHECK_DETAILS } from "../../model/template.paths";
import { getAccessToken, getUserId } from "../../session/helper";
import { APPLICATION_NAME, CHS_URL } from "../../config/config";
import { getCertifiedCopyItem, getBasket, addItemToBasket } from "../../client/api.client";
import { mapDeliveryDetails, mapDeliveryMethod } from "../../utils/check.details.utils";
import { getFullFilingHistoryDescription } from "../../config/api.enumerations";
import { mapFilingHistoryDescriptionValues, removeAsterisks, mapDate, addCurrencySymbol } from "../../service/map.filing.history.service";
import { mapPageHeader } from "../../utils/page.header.utils";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certifiedCopyItem: CertifiedCopyItem = await getCertifiedCopyItem(accessToken, req.params.certifiedCopyId);
        const basket: Basket = await getBasket(accessToken);
        const SERVICE_URL = `/company/${certifiedCopyItem.companyNumber}/orderable/certified-copies`;
        const pageHeader = mapPageHeader(req);

        res.render(CERTIFIED_COPY_CHECK_DETAILS, {
            backUrl: replaceCertifiedCopyId(CERTIFIED_COPY_DELIVERY_DETAILS, req.params.certifiedCopyId),
            companyNumber: certifiedCopyItem.companyNumber,
            companyName: certifiedCopyItem.companyName,
            deliveryMethod: mapDeliveryMethod(certifiedCopyItem.itemOptions),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            filingHistoryDocuments: mapFilingHistoriesDocuments(certifiedCopyItem.itemOptions.filingHistoryDocuments),
            totalCost: addCurrencySymbol(certifiedCopyItem.totalItemCost),
            SERVICE_URL,
            ...pageHeader
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certifiedCopyId: string = req.params.certifiedCopyId;
        const userId = getUserId(req.session);
        const resp = await addItemToBasket(
            accessToken,
            { itemUri: `/orderable/certified-copies/${certifiedCopyId}` });
        logger.info(`item added to basket certified_copy_id=${certifiedCopyId}, user_id=${userId}, company_number=${resp.companyNumber}, redirecting to basket`);
        res.redirect(`${CHS_URL}/basket`);
    } catch (error) {
        logger.error(`error=${error}`);
        return next(error);
    }
};

export const mapFilingHistoriesDocuments = (filingHistoryDocuments: FilingHistoryDocuments[]) => {
    const mappedFilingHistories = filingHistoryDocuments.map(filingHistoryDocument => {
        const descriptionFromFile = getFullFilingHistoryDescription(filingHistoryDocument.filingHistoryDescription);
        const mappedFilingHistroyDescription = mapFilingHistoryDescriptionValues(descriptionFromFile, filingHistoryDocument.filingHistoryDescriptionValues || {});
        const cleanedFilingHistoryDescription = removeAsterisks(mappedFilingHistroyDescription);
        const mappedFilingHistoryDescriptionDate = mapDate(filingHistoryDocument.filingHistoryDate);
        const costWithCurrencySymbol = addCurrencySymbol(filingHistoryDocument.filingHistoryCost);
        return {
            filingHistoryDate: mappedFilingHistoryDescriptionDate,
            filingHistoryDescription: cleanedFilingHistoryDescription,
            filingHistoryId: filingHistoryDocument.filingHistoryId,
            filingHistoryType: filingHistoryDocument.filingHistoryType,
            filingHistoryCost: costWithCurrencySymbol
        };
    });
    return mappedFilingHistories;
};

export default [route];
