import { NextFunction, Request, Response } from "express";

import { getAccessToken, getUserId } from "../../../session/helper";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { postInitialCertificateItem } from "../../../client/api.client";
import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_OPTIONS,
    replaceCertificateId
} from "../../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../../config/config";
import { CompanyStatus } from "../model/CompanyStatus";
import { BadRequest } from "http-errors";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../../model/template.paths";

const logger = createLogger(APPLICATION_NAME);

// TODO: confirm whether user journey for active companies is valid for other statuses
const statusRedirectMappings = new Map<string, string>([
    [CompanyStatus.ACTIVE, LP_CERTIFICATE_OPTIONS],
    [CompanyStatus.DISSOLVED, DISSOLVED_CERTIFICATE_DELIVERY_DETAILS]
]);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.debug(`LP Certificate render - company_number=${req?.params?.companyNumber}`);

        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);

        // TODO: handle missing company number?
        const certificateItem: CertificateItem = await postInitialCertificateItem(accessToken, {
            companyNumber: req.params.companyNumber
        });

        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

        const redirect = statusRedirectMappings.get(certificateItem.itemOptions.companyStatus) || "";
        if (!redirect) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE);
        } else {
            res.redirect(replaceCertificateId(redirect, certificateItem.id));
        }
    } catch (err) {
        if (err === BadRequest) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE);
        } else {
            logger.error(`${err}`);
            next(err);
        }
    }
};
