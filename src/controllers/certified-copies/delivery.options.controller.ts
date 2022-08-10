import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { CertifiedCopyItem, CertifiedCopyItemPatchRequest} from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { getCertifiedCopyItem, patchCertifiedCopyItem } from "../../client/api.client";
import { DELIVERY_DETAILS, DELIVERY_OPTIONS } from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME, DISPATCH_DAYS } from "../../config/config";
import { DELIVERY_OPTION_SELECTION } from "../../model/error.messages";
import { createGovUkErrorData } from "../../model/govuk.error.data";

const PAGE_TITLE: string = "Delivery options - Order a certified document - GOV.UK";
const logger = createLogger(APPLICATION_NAME);

const validators = [
    check("deliveryOptions").not().isEmpty().withMessage(DELIVERY_OPTION_SELECTION)
];

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certifiedCopyItem: CertifiedCopyItem = await getCertifiedCopyItem(accessToken, req.params.certifiedCopyId);
        const companyNumber: string = certifiedCopyItem.companyNumber;
        const filingType: string = certifiedCopyItem.itemOptions.filingHistoryDocuments[0].filingHistoryType;
        const EXPRESS_COST = filingType === "NEWINC" ? "100" : "50";
        const STANDARD_COST = filingType === "NEWINC" ? "30" : "15";
        logger.info(`Get certified copy item, id=${certifiedCopyItem.id}, user_id=${userId}, company_number=${certifiedCopyItem.companyNumber}`);
        return res.render(DELIVERY_OPTIONS, {
            DISPATCH_DAYS,
            EXPRESS_COST,
            STANDARD_COST,
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
        const certifiedCopyItem: CertifiedCopyItem = await getCertifiedCopyItem(accessToken, req.params.certifiedCopyId);
        const companyNumber: string = certifiedCopyItem.companyNumber;
        const filingType: string = certifiedCopyItem.itemOptions.filingHistoryDocuments[0].filingHistoryType;
        const EXPRESS_COST = filingType === "NEWINC" ? "100" : "50";
        const STANDARD_COST = filingType === "NEWINC" ? "30" : "15";
        logger.info(`Get certifiied copy item, id=${certifiedCopyItem.id}, user_id=${userId}, company_number=${certifiedCopyItem.companyNumber}`);
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            const errorText = errorArray[errorArray.length - 1].msg as string;
            const deliveryOptionsErrorData = createGovUkErrorData(errorText, "#deliveryOptions", true, "");
            return res.render(DELIVERY_OPTIONS, {
                DISPATCH_DAYS,
                EXPRESS_COST,
                STANDARD_COST,
                pageTitleText: PAGE_TITLE,
                SERVICE_URL: `/company/${companyNumber}/orderable/certified-copies`,
                backLink: `/company/${companyNumber}/certified-documents`,
                deliveryOptionsErrorData,
                errorList: [deliveryOptionsErrorData]
            });
        } else {
            let certifiedCopyItemPatchRequest: CertifiedCopyItemPatchRequest;
            certifiedCopyItemPatchRequest = {
                itemOptions: {
                    deliveryTimescale: req.body.deliveryOptions
                }
            };
            const patchedCertifiedCopyItem = await patchCertifiedCopyItem(accessToken, req.params.certifiedCopyId, certifiedCopyItemPatchRequest);
            logger.info(`Patched certified copy item with delivery option, id=${req.params.certifiedCopyId}, user_id=${userId}, company_number=${patchedCertifiedCopyItem.companyNumber}`);
            return res.redirect(DELIVERY_DETAILS);
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export default [...validators, route];
