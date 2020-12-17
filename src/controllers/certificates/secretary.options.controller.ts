import { NextFunction, Request, Response } from "express";
import { getAccessToken } from "../../session/helper";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem } from "../../client/api.client";
import { CERTIFICATE_SECRETARY_OPTIONS } from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`;
    const backLink = setBackLink(certificateItem);

    return res.render(CERTIFICATE_SECRETARY_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
        backLink,
        SERVICE_URL
    });
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.redirect("delivery-details");
    } catch (err) {
        logger.error(`{$err}`);
        return next(err);
    }
};

export const setBackLink = (certificateItem: CertificateItem) => {
    let backLink;
    if (certificateItem.itemOptions?.directorDetails?.includeBasicInformation) {
        backLink = "director-options";
    } else if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        backLink = "registered-office-options";
    } else {
        backLink = "certificate-options";
    }
    return backLink;
};
