import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { CertificateItem, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { appendItemToBasket, getBasket, getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { DELIVERY_DETAILS, DELIVERY_OPTIONS, EMAIL_OPTIONS } from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { setServiceUrl } from "../../utils/service.url.utils";
import { Session } from "@companieshouse/node-session-handler";
import { EMAIL_OPTION_SELECTION } from "../../model/error.messages";
import { createGovUkErrorData } from "../../model/govuk.error.data";
import { BY_ITEM_KIND, StaticRedirectCallback } from "./StaticRedirectCallback";
import { getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { mapPageHeader } from "../../utils/page.header.utils";

const EMAIL_OPTION_FIELD: string = "emailOptions";
const PAGE_TITLE: string = "Email options - Order a certificate - GOV.UK";
const logger = createLogger(APPLICATION_NAME);

const validators = [
    check("emailOptions").not().isEmpty().withMessage(EMAIL_OPTION_SELECTION)
];

const redirectCallback = new StaticRedirectCallback(BY_ITEM_KIND);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        const basketLink: BasketLink = await getBasketLink(req);
        const pageHeader = mapPageHeader(req);
        return res.render(EMAIL_OPTIONS, {
            emailOption: certificateItem.itemOptions.includeEmailCopy,
            templateName: EMAIL_OPTIONS,
            pageTitleText: PAGE_TITLE,
            SERVICE_URL: setServiceUrl(certificateItem),
            backLink: setBackLink(certificateItem, req.session),
            ...basketLink,
            ...pageHeader
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const emailOption: boolean = req.body[EMAIL_OPTION_FIELD];
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            const errorText = errorArray[errorArray.length - 1].msg as string;
            const emailOptionsErrorData = createGovUkErrorData(errorText, "#emailOptions", true, "");
            return res.render(EMAIL_OPTIONS, {
                pageTitleText: PAGE_TITLE,
                SERVICE_URL: setServiceUrl(certificateItem),
                backLink: setBackLink(certificateItem, req.session),
                emailOptionsErrorData,
                errorList: [emailOptionsErrorData]
            });
        } else {
            const certificateItemPatchRequest: CertificateItemPatchRequest = {
                itemOptions: {
                    includeEmailCopy: emailOption
                }
            };
            const certificatePatchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItemPatchRequest);
            logger.info(`Patched certificate item with email option, id=${req.params.certificateId}, user_id=${userId}, company_number=${certificatePatchResponse.companyNumber}`);
            const basket = await getBasket(accessToken);
            if (basket.enrolled) {
                await appendItemToBasket(accessToken, { itemUri: certificateItem.links.self });
                return redirectCallback.redirectEnrolled({
                    response: res,
                    items: basket.items,
                    deliveryDetails: basket.deliveryDetails
                });
            }
            return res.redirect(DELIVERY_DETAILS);
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export const setBackLink = (_certificateItem: CertificateItem, _session: Session | undefined):string => {
    return DELIVERY_OPTIONS;
};

export default [...validators, route];
