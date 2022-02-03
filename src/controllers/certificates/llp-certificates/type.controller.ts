import { NextFunction, Request, Response } from "express";

import { getAccessToken, getUserId } from "../../../session/helper";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { postInitialCertificateItem } from "../../../client/api.client";
import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_OPTIONS,
    replaceCertificateId
} from "../../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../../config/config";
import { CompanyStatus } from "../model/CompanyStatus";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../../model/template.paths";
import { BadRequest } from "http-errors";

const logger = createLogger(APPLICATION_NAME);

const statusRedirectMappings = new Map<string, string>([
    [CompanyStatus.ACTIVE, LLP_CERTIFICATE_OPTIONS],
    [CompanyStatus.LIQUIDATION, LLP_CERTIFICATE_OPTIONS],
    [CompanyStatus.DISSOLVED, DISSOLVED_CERTIFICATE_DELIVERY_DETAILS]
]);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.debug(`LLP Certificate render - company_number=${req?.params?.companyNumber}`);

        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);

        const certificateItem: CertificateItem = await postInitialCertificateItem(accessToken, {
            companyNumber: req?.params?.companyNumber
        });

        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

        res.redirect(replaceCertificateId(statusRedirectMappings.get(certificateItem.itemOptions.companyStatus) || "", certificateItem.id));
    } catch (err) {
        if (err === BadRequest) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE);
        } else {
            logger.error(`${err}`);
            next(err);
        }
    }
};
