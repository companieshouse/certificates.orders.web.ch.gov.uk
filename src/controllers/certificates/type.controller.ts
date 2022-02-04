import { NextFunction, Request, Response } from "express";

import { getAccessToken, getUserId } from "../../session/helper";
import { postInitialCertificateItem } from "../../client/api.client";
import { replaceCertificateId } from "../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { CertificateItem } from "../../../../api-sdk-node/dist/services/order/certificates";
import { ApiErrorResponse, ApiResponse, ApiResult } from "../../../../api-sdk-node/dist/services/resource";
import { Failure, Success } from "../../../../api-sdk-node/dist/services/result";
import { InternalServerError } from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export class TypeController {
    constructor (private statusRedirectMappings: Map<string, string>) {
        this.statusRedirectMappings = statusRedirectMappings;
    }

    public async render (req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accessToken: string = getAccessToken(req.session);
            const companyNumber = req.params.companyNumber;
            logger.debug(`Certificate render function called, company_number=${companyNumber}`);
            const userId = getUserId(req.session);
            // TODO: handle missing company number?
            const response = await postInitialCertificateItem(accessToken, {
                companyNumber
            });
            this.handleResponse(response, userId, res, next);
        } catch (err) {
            logger.error(`${err}`);
            next(err);
        }
    }

    private handleResponse (response: ApiResult<ApiResponse<CertificateItem>>, userId: string, res: Response, next: NextFunction) {
        if (response.isSuccess()) {
            this.handleSuccessfulResponse(response, next, userId, res);
        } else {
            this.handleErrorResponse(response, res, next);
        }
    }

    private handleSuccessfulResponse (response: Success<ApiResponse<CertificateItem>, ApiErrorResponse>, next: NextFunction, userId: string, res: Response) {
        const certificateItem = response.value.resource;
        if (!certificateItem) {
            logger.error("Failed to retrieve certificate item");
            next(InternalServerError);
            return;
        }
        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        const redirect = this.statusRedirectMappings.get(certificateItem.itemOptions.companyStatus) || "";
        if (!redirect) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
        } else {
            res.redirect(replaceCertificateId(redirect, certificateItem.id));
        }
    }

    private handleErrorResponse (response: Failure<ApiResponse<CertificateItem>, ApiErrorResponse>, res: Response, next: NextFunction) {
        const validErrors = [
            "ERR_COMPANY_TYPE_INVALID",
            "ERR_COMPANY_STATUS_INVALID"
        ];
        if (response.value.httpStatusCode === 400 && response.value.errors) {
            for (const err of response.value.errors) {
                for (const key of validErrors) {
                    if (err.errorValues && err.errorValues[key]) {
                        res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
                        return;
                    }
                }
            }
        }
        logger.error("Failed to retrieve certificate item");
        next(InternalServerError);
    }
}
