import { NextFunction, Request, Response } from "express";
import { getAccessToken, getUserId } from "../session/helper";
import { CertificateItem, RegisteredOfficeAddressDetailsRequest, CertificateItemPatchRequest, ItemOptions, RegisteredOfficeAddressDetails } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../client/api.client";
import { getBasketLink } from "../utils/basket.utils";
import { BasketLink } from "../model/BasketLink";
import { mapPageHeader } from "../utils/page.header.utils";
import { APPLICATION_NAME } from "../config/config";
import { createLogger } from "ch-structured-logging";

const logger = createLogger(APPLICATION_NAME);

export const renderRegisteredOfficeOptions = async (req: Request, res: Response, isLLPCertificate: boolean, route: string, optionFilter): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const basketLink: BasketLink = await getBasketLink(req);
    const isFullPage = req.query.layout === "full";
    const pageHeader = mapPageHeader(req);

    let SERVICE_URL = "";
    if (isLLPCertificate) {
        SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/llp-certificates`;
    } else {
        SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`
    }
    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

        return res.render(route, {
        companyNumber: certificateItem.companyNumber,
        SERVICE_URL,
        optionFilter: optionFilter,
        isFullPage: isFullPage,
        backLink: generateBackLink(isFullPage),
        roaSelection: certificateItem.itemOptions.registeredOfficeAddressDetails?.includeAddressRecordsType,
        ...basketLink,
        ...pageHeader
    });
};

export const generateBackLink = (fullPage: boolean) => fullPage ? "registered-office-options" : "certificate-options";