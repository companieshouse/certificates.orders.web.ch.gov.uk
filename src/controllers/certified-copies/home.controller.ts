import { NextFunction, Request, Response } from "express";
import {
    CERTIFIED_COPY_FILING_HISTORY,
    replaceCompanyNumber,
    ROOT_CERTIFIED_COPY,
    START_BUTTON_PATH_SUFFIX
} from "../../model/page.urls";
import { CERTIFIED_COPY_INDEX, YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { API_KEY, APPLICATION_NAME, CHS_URL, DISPATCH_DAYS, STANDARD_FEE, EXPRESS_FEE, STANDARD_INCORP_FEE, EXPRESS_INCORP_FEE } from "../../config/config";
import { getCompanyProfile } from "../../client/api.client";
import { createLogger } from "@companieshouse/structured-logging-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { getBasketLimit, getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { BasketLimit, BasketLimitState } from "../../model/BasketLimit";
import { getWhitelistedReturnToURL } from "../../utils/request.util";
import { mapPageHeader } from "../../utils/page.header.utils";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyNumber: string = req.params.companyNumber;
        const startNowPath = `${replaceCompanyNumber(ROOT_CERTIFIED_COPY, companyNumber)}${START_BUTTON_PATH_SUFFIX}`;
        let startNowUrl = `${CHS_URL}${startNowPath}`;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyName : string = companyProfile.companyName;
        const companyType = companyProfile.type;
        const filingHistory = companyProfile.links.filingHistory;
        const SERVICE_URL = `/company/${companyNumber}/orderable/certified-copies`;
        const dispatchDays: string = DISPATCH_DAYS;
        const moreTabUrl: string = "/company/" + companyNumber + "/more";
        const basketLink: BasketLink = await getBasketLink(req);
        const basketLimit: BasketLimit = getBasketLimit(basketLink);
        const pageHeader = mapPageHeader(req);
        const standard_fee = STANDARD_FEE;
        const express_fee = EXPRESS_FEE;
        const standard_incorp_fee = STANDARD_INCORP_FEE;
        const express_incorp_fee = EXPRESS_INCORP_FEE;

        if (req.url == startNowPath) {
            logger.debug(`Start now button clicked, req.url = ${req.url}`);
            if (displayBasketLimitError(req, res, basketLimit, companyNumber)) {
                logger.debug(`Disable start now button.`);
                startNowUrl = "";
            } else {
                return;
            }
        }

        if (!filingHistory || (filingHistory && companyType === "uk-establishment")) {
            const serviceName = null;
            res.render(YOU_CANNOT_USE_THIS_SERVICE, { serviceName });
        } else {
            res.render(CERTIFIED_COPY_INDEX,
                {
                    startNowUrl,
                    companyNumber,
                    SERVICE_URL,
                    dispatchDays,
                    standard_fee, 
                    express_fee, 
                    standard_incorp_fee, 
                    express_incorp_fee,
                    moreTabUrl,
                    companyName,
                    ...basketLink,
                    ...basketLimit,
                    ...pageHeader });
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

/**
 * displayBasketLimitError controls the presentation of a basket limit warning/error as appropriate.
 * @return whether a basket limit error is to be displayed (<code>true</code>), or not (<code>false</code>)
 */
const displayBasketLimitError = (req: Request,
                                 res: Response,
                                 basketLimit: BasketLimit,
                                 companyNumber: string) : boolean => {
    if (basketLimit.basketLimitState == BasketLimitState.BELOW_LIMIT) {
        const nextPage = `${CHS_URL}${replaceCompanyNumber(CERTIFIED_COPY_FILING_HISTORY, companyNumber)}`;
        logger.debug(`Basket is not full, redirecting to  ${nextPage}.`)
        res.redirect(getWhitelistedReturnToURL(nextPage))
        return false;
    } else {
        logger.debug(`Basket is full, display error.`)
        basketLimit.basketLimitState = BasketLimitState.DISPLAY_LIMIT_ERROR; // styles button as disabled
        return true
    }
}
