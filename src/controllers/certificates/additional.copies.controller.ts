import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { CertificateItem, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { appendItemToBasket, getBasket, getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { DELIVERY_DETAILS, DELIVERY_OPTIONS, EMAIL_OPTIONS, ADDITIONAL_COPIES, ADDITIONAL_COPIES_QUANTITY } from "../../model/template.paths";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import { setServiceUrl } from "../../utils/service.url.utils";
import { Session } from "@companieshouse/node-session-handler";
import { createGovUkErrorData } from "../../model/govuk.error.data";
import { renderPage } from "../../utils/render.utils";
import { BY_ITEM_KIND, StaticRedirectCallback } from "./StaticRedirectCallback";
import { ADDITIONAL_COPIES_OPTION_SELECTION } from "../../model/error.messages";
import CertificateSessionData from "session/CertificateSessionData";

const logger = createLogger(APPLICATION_NAME);
const ADDITIONAL_COPIES_OPTION_FIELD: string = "additionalCopiesOptions";
const PAGE_TITLE: string = "Additional Copies - Order a certificate - GOV.UK";
const redirectCallback = new StaticRedirectCallback(BY_ITEM_KIND);

const validators = [
    check("additionalCopiesOptions").not().isEmpty().withMessage(ADDITIONAL_COPIES_OPTION_SELECTION)
];

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`Render additional copies options page`);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const backLink = setBackLink(certificateItem, req.session)

        const userSelection = getSelectionFromCertificate(certificateItem) || 
                            getSelectionFromSession(req) ||
                            0;

        await renderPage(req, res, ADDITIONAL_COPIES, PAGE_TITLE, certificateItem, backLink, userSelection);
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const errors = validationResult(req);
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const additionalCopies: string = req.body[ADDITIONAL_COPIES_OPTION_FIELD];
        let certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            const errorText = errorArray[errorArray.length - 1].msg as string;
            const additionalCopiesErrorData = createGovUkErrorData(errorText, "#additionalCopiesOptions", true, "");
            return res.render(ADDITIONAL_COPIES, {
                pageTitleText: PAGE_TITLE,
                SERVICE_URL: setServiceUrl(certificateItem),
                backLink: setBackLink(certificateItem, req.session),
                additionalCopiesErrorData,
                errorList: [additionalCopiesErrorData],
                radioButtonSelection: additionalCopies
            });
        } else {
            if (additionalCopies === 'true') {
                req.session?.setExtraData("certificates-orders-web-ch-gov-uk", {
                    includesAdditionalCopies: additionalCopies
                } as CertificateSessionData);
                logger.info(`User selected 'Yes' to additional copies, redirecting to Additional Copies Quantity page`);
                return res.redirect(ADDITIONAL_COPIES_QUANTITY);
            } else {
                logger.info(`User selected 'No' to additional copies, updating basket and redirecting to Delivery Details page`);
                if (certificateItem.quantity > 1){
                    // If user previously selected additional copies and now chooses no, reset quantity back to 1.
                    const baseQuantity = 1;
                    const certificateItemPatchRequest: CertificateItemPatchRequest = {
                        quantity : baseQuantity
                };
                certificateItem = await patchCertificateItem(accessToken, req.params.certificateId, certificateItemPatchRequest);
                logger.info(`Total quantity has been reset back to: ${certificateItem.quantity} ` );
            }
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
        }
        } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined):string => {
    if (certificateItem.itemOptions?.deliveryTimescale === "same-day") {
        return EMAIL_OPTIONS;
    }
    return DELIVERY_OPTIONS;
};

export const getSelectionFromCertificate = (certificateItem: CertificateItem): number => {
    if (!certificateItem.quantity || certificateItem.quantity < 0) {
        return 0;
    }
    return certificateItem.quantity > 1? 1: 2;
}

export const getSelectionFromSession = (req: Request): number => {
    const isAddCopies: String = (req.session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.includesAdditionalCopies;
    if (isAddCopies) {
        if (isAddCopies == "true") {
            return 1;
        }
        return 2;
    }
    return 0;
} 

export default [...validators, route];
