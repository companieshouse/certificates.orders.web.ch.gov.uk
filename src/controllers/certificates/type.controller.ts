import { Request, Response, NextFunction } from "express";

import { getAccessToken, getUserId } from "../../session/helper";
import { CertificateItemPostRequest, CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { postInitialCertificateItem } from "../../client/api.client";
import {
    CERTIFICATE_OPTIONS,
    replaceCertificateId,
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_OPTIONS
} from "../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { CompanyStatus } from "./model/CompanyStatus";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { BadRequest } from "http-errors";

const logger = createLogger(APPLICATION_NAME);

const statusRedirectMappings = new Map<string, string>([
    [CompanyStatus.ACTIVE, CERTIFICATE_OPTIONS],
    [CompanyStatus.LIQUIDATION, CERTIFICATE_OPTIONS],
    [CompanyStatus.DISSOLVED, DISSOLVED_CERTIFICATE_DELIVERY_DETAILS]
]);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;
        logger.debug(`Certificate render function called, company_number=${companyNumber}`);
        const userId = getUserId(req.session);
        // TODO: handle missing company number?
        const certificateItem: CertificateItem = await postInitialCertificateItem(accessToken, {
            companyNumber
        });
        const companyStatus = certificateItem.itemOptions.companyStatus;

        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        const redirect = statusRedirectMappings.get(companyStatus) || "";
        if (!redirect) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
        } else {
            res.redirect(replaceCertificateId(redirect, certificateItem.id));
        }
    } catch (err) {
        if (err === BadRequest) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
        } else {
            logger.error(`${err}`);
            next(err);
        }
    }
};
