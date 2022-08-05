import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { CertifiedCopyItem, CertifiedCopyItemPatchRequest} from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { appendItemToBasket, getBasket, getCertifiedCopyItem, patchCertifiedCopyItem } from "../../client/api.client";
import { DELIVERY_DETAILS, DELIVERY_OPTIONS, EMAIL_OPTIONS } from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME, DISPATCH_DAYS } from "../../config/config";
import { DELIVERY_OPTION_SELECTION } from "../../model/error.messages";
import { createGovUkErrorData } from "../../model/govuk.error.data";
import { BY_ITEM_KIND, StaticRedirectCallback } from "../certificates/StaticRedirectCallback";

const DELIVERY_OPTION_FIELD: string = "deliveryOptions";
const PAGE_TITLE: string = "Delivery options - Order a certified document - GOV.UK";
const logger = createLogger(APPLICATION_NAME);

const validators = [
    check("deliveryOptions").not().isEmpty().withMessage(DELIVERY_OPTION_SELECTION)
];


const redirectCallback = new StaticRedirectCallback(BY_ITEM_KIND);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certifiedCopyItem: CertifiedCopyItem = await getCertifiedCopyItem(accessToken, req.params.certifiedCopyId);
        const companyNumber: string = certifiedCopyItem.companyNumber;
        const filingType: string = certifiedCopyItem.itemOptions.filingHistoryDocuments[0].filingHistoryType;
        const expressCost = filingType === "NEWINC" ? "100" : "50";
        const standardCost = filingType === "NEWINC" ? "50" : "15";
        logger.info(`Get certified copy item, id=${certifiedCopyItem.id}, user_id=${userId}, company_number=${certifiedCopyItem.companyNumber}`);
        return res.render(DELIVERY_OPTIONS, {
            DISPATCH_DAYS,
            expressCost,
            standardCost,
            deliveryOption: certifiedCopyItem.itemOptions.deliveryTimescale,
            templateName: DELIVERY_OPTIONS,
            pageTitleText: PAGE_TITLE,
            SERVICE_URL: `/company/${companyNumber}/orderable/certified-copies`,
            backLink: `/company/${companyNumber}/certified-documents`
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
        const deliveryOption: string = req.body[DELIVERY_OPTION_FIELD];
        const certifiedCopyItem: CertifiedCopyItem = await getCertifiedCopyItem(accessToken, req.params.certifiedCopyId);
        const companyNumber: string = certifiedCopyItem.companyNumber;
        logger.info(`Get certifiied copy item, id=${certifiedCopyItem.id}, user_id=${userId}, company_number=${certifiedCopyItem.companyNumber}`);
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            const errorText = errorArray[errorArray.length - 1].msg as string;
            const deliveryOptionsErrorData = createGovUkErrorData(errorText, "#deliveryOptions", true, "");
            return res.render(DELIVERY_OPTIONS, {
                pageTitleText: PAGE_TITLE,
                SERVICE_URL: `/company/${companyNumber}/orderable/certified-copies`,
                backLink: `/company/${companyNumber}/certified-documents`,
                deliveryOptionsErrorData,
                errorList: [deliveryOptionsErrorData]
            });
        } else {
                return res.redirect(DELIVERY_DETAILS);
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export default [...validators, route];
