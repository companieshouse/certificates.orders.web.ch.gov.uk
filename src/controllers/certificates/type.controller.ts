import { NextFunction, Request, Response } from "express";

import { getAccessToken, getUserId } from "../../session/helper";
import { postInitialCertificateItem } from "../../client/api.client";
import { replaceCertificateId } from "../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Failure } from "@companieshouse/api-sdk-node/dist/services/result";
import { BadRequest, InternalServerError } from "http-errors";

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
            const response = await postInitialCertificateItem(accessToken, {
                companyNumber
            });
            if (response.isSuccess()) {
                this.handleSuccessfulResponse(response.value.resource, getUserId(req.session), res);
            } else {
                this.handleErrorResponse(response, res);
            }
        } catch (err) {
            logger.error(`${err}`);
            next(err);
        }
    }

    private handleSuccessfulResponse (certificateItem: CertificateItem | undefined, userId: string, res: Response) {
        if (!certificateItem) {
            throw new InternalServerError("Failed to retrieve certificate item");
        }
        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        const redirect = this.statusRedirectMappings.get(certificateItem.itemOptions.companyStatus) || "";
        if (!redirect) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
        } else {
            res.redirect(replaceCertificateId(redirect, certificateItem.id));
        }
    }

    private handleErrorResponse (apiResponse: Failure<ApiResponse<CertificateItem>, ApiErrorResponse>, res: Response) {
        if (apiResponse.value.httpStatusCode === 400 && apiResponse.value.errors) {
            for (const err of apiResponse.value.errors) {
                if (err.error === "company-status-invalid") {
                    res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
                    return;
                }
            }
            throw new BadRequest("Unhandled client error");
        }
        throw new InternalServerError("Failed to retrieve certificate item");
    }
}
