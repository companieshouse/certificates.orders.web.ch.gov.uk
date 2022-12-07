import { Request, Response, NextFunction } from "express";
import { MISSING_IMAGE_DELIVERY_INDEX } from "../../model/template.paths";
import { MISSING_IMAGE_DELIVERY_CREATE, replaceCompanyNumberAndFilingHistoryId } from "../../model/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { getCompanyProfile } from "../../client/api.client";
import {API_KEY, APPLICATION_NAME} from "../../config/config";
import { getBasketLimit, getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { BasketLimit, BasketLimitState } from "../../model/BasketLimit";
import {createLogger} from "ch-structured-logging";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errorParam = req.query.error;
        const companyNumber: string = req.params.companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyName: string = companyProfile.companyName;
        const filingHistoryId: string = req.params.filingHistoryId;
        let startNowUrl: string = replaceCompanyNumberAndFilingHistoryId(MISSING_IMAGE_DELIVERY_CREATE, companyNumber, filingHistoryId);
        const SERVICE_URL = `/company/${companyNumber}/filing-history`;
        const basketLink: BasketLink = await getBasketLink(req);
        const basketLimit: BasketLimit = getBasketLimit(basketLink);

        const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

        if (errorParam === "display-limit-error" && signedIn) {
            basketLimit.basketLimitState = BasketLimitState.DISPLAY_LIMIT_ERROR;
            startNowUrl = "";
        } else {
            req.query.params = "";
        }

        res.render(MISSING_IMAGE_DELIVERY_INDEX,
            {
                companyNumber,
                startNowUrl,
                SERVICE_URL,
                companyName,
                ...basketLink,
                ...basketLimit
            });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
