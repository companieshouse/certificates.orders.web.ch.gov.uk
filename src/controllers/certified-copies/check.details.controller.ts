import { NextFunction, Request, Response } from "express";
import { createLogger } from "ch-structured-logging";
import { CertifiedCopyItem, FilingHistoryDocuments } from "ch-sdk-node/dist/services/order/certified-copies";
import { Basket } from "ch-sdk-node/dist/services/order/basket";
import { Filing } from "ch-sdk-node/dist/services/filing-history";

import { CERTIFIED_COPY_DELIVERY_DETAILS, replaceCertifiedCopyId } from "../../model/page.urls";
import { CERTIFIED_COPY_CHECK_DETAILS } from "../../model/template.paths";
import { getAccessToken, getUserId } from "../../session/helper";
import { APPLICATION_NAME, CHS_URL } from "../../config/config";
import { getCertifiedCopyItem, getBasket, addItemToBasket, getFilingHistoryById } from "../../client/api.client";
import { mapDeliveryDetails, mapDeliveryMethod } from "../../utils/check.details.utils";
import { getFullFilingHistoryDescription } from "../../config/api.enumerations";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certifiedCopyItem: CertifiedCopyItem = await getCertifiedCopyItem(accessToken, req.params.certifiedCopyId);
        const basket: Basket = await getBasket(accessToken);
        res.render(CERTIFIED_COPY_CHECK_DETAILS, {
            backUrl: replaceCertifiedCopyId(CERTIFIED_COPY_DELIVERY_DETAILS, req.params.certifiedCopyId),
            companyNumber: certifiedCopyItem.companyNumber,
            companyName: certifiedCopyItem.companyName,
            deliveryMethod: mapDeliveryMethod(certifiedCopyItem.itemOptions),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            filingHistoryDocuments: await mapFilingHistoriesDocuments(
                certifiedCopyItem.itemOptions.filingHistoryDocuments,
                certifiedCopyItem.companyNumber, accessToken),
            totalCost: addCurrencySymbol(certifiedCopyItem.totalItemCost)
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

export const mapFilingHistoryDescriptionValues = (description: string, descriptionValues: Record<string, any>) => {
    if (descriptionValues.description) {
        return descriptionValues.description;
    } else {
        return Object.entries(descriptionValues).reduce((newObj, [key, val]) => {
            if (key === "statement-of-capital") {
                const statementOfCapital = getFullFilingHistoryDescription(key);
                const statementOfCapitalDate = replaceVariables("date", val.date, statementOfCapital);
                console.log(statementOfCapitalDate);
                return statementOfCapitalDate;
            } else {
                return replaceVariables(key, val, newObj);
            }
        }, description);
    }
};

export const lookupFh = (descriptionKey: string, descriptionValues: Record<string, any>) => {
    const description = getFullFilingHistoryDescription(descriptionKey);
    return Object.entries(descriptionValues).reduce((newObj, [key, val]) => {
        const value = key.includes("date") ? mapDateFullMonth(val) : val;
        return newObj.replace("{" + key + "}", value as string);
    }, description);
};

export const mapFilingHistoryDescription = (filing: Filing) => {
    let filingHistoryDescription = "";
    if (filing?.descriptionValues?.description) {
        filingHistoryDescription += filing?.descriptionValues?.description;
    } else if (filing?.description && filing?.descriptionValues) {
        filingHistoryDescription += lookupFh(filing.description, filing.descriptionValues);
    }

    // capital
    if (filing?.descriptionValues?.capital) {
        filingHistoryDescription += filing?.descriptionValues?.capital.reduce((accum, capitalData) => {
            if (!capitalData.date || filing.description === "capital-cancellation-treasury-shares-with-date-currency-capital-figure" ||
                filing.description === "second-filing-capital-cancellation-treasury-shares-with-date-currency-capital-figure") {
                return `${accum}, ${capitalData.currency} ${capitalData.figure}`;
            } else {
                return `${accum}, ${capitalData.currency} ${capitalData.figure} on ${capitalData.date}`;
            }
        }, "");
    }
    return removeAsterisks(filingHistoryDescription);
};

export const replaceVariables = (key, val, newObj) => {
    const value = key.includes("date") ? mapDateFullMonth(val) : val;
    return newObj.replace("{" + key + "}", value as string);
};

export const removeAsterisks = (description: string) => {
    return description.replace(/\*/g, "");
};

export const addCurrencySymbol = (cost: string) => {
    return "£" + cost;
};

export const mapDate = (dateString: string): string => {
    const d = new Date(dateString);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    return `${day} ${month} ${year}`;
};

export const mapDateFullMonth = (dateString: string): string => {
    const d = new Date(dateString);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    return `${day} ${month} ${year}`;
};

export const mapFilingHistoriesDocuments = (filingHistoryDocuments: FilingHistoryDocuments[], companyNumber, accessToken) => {
    const mappedFilingHistories = Promise.all(filingHistoryDocuments.map(async (filingHistoryDocument) => {
        const result = await getFilingHistoryById(accessToken, companyNumber, filingHistoryDocument.filingHistoryId);
        const mappedFilingHistroyDescription = mapFilingHistoryDescription(result);
        const mappedFilingHistoryDescriptionDate = mapDate(filingHistoryDocument.filingHistoryDate);
        const costWithCurrencySymbol = addCurrencySymbol(filingHistoryDocument.filingHistoryCost);
        return {
            filingHistoryDate: mappedFilingHistoryDescriptionDate,
            filingHistoryDescription: mappedFilingHistroyDescription,
            filingHistoryId: filingHistoryDocument.filingHistoryId,
            filingHistoryType: filingHistoryDocument.filingHistoryType,
            filingHistoryCost: costWithCurrencySymbol
        };
    }));
    return mappedFilingHistories;
};

export default [route];
