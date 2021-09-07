import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { LP_CERTIFICATE_PRINCIPLE_PLACE_OPTIONS } from "../../../model/template.paths";
import { CertificateItem, CertificateItemPatchRequest, ItemOptions, PrinciplePlaceOfBusinessDetailsRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../../../client/api.client";
import { getAccessToken, getUserId } from "../../../session/helper";
import { createLogger } from "ch-structured-logging";
import { principlePlaceOfBusinessValidationRules, validate } from "../../../validation/lp-certificates/principle.place.options.validation";
import { APPLICATION_NAME } from "../../../config/config";
import CertificateSessionData from "../../../session/CertificateSessionData";
import { PrinciplePlaceOfBusinessOptionName } from "./PrinciplePlaceOfBusinessOptionName";
import { LP_ROOT_CERTIFICATE, replaceCompanyNumber } from "../../../model/page.urls";

const logger = createLogger(APPLICATION_NAME);

const PRINCIPLE_PLACE_OPTION: string = "principlePlace";

export const optionFilter = (items) => items.filter((item) => item.display)

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const itemOptions: ItemOptions = certificateItem.itemOptions;
    const SERVICE_URL = replaceCompanyNumber(LP_ROOT_CERTIFICATE, certificateItem.companyNumber);
    const isFullPage = req.query.layout === "full";

    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

    return res.render(LP_CERTIFICATE_PRINCIPLE_PLACE_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
        SERVICE_URL,
        optionFilter: optionFilter,
        isFullPage: isFullPage,
        backLink: generateBackLink(isFullPage)
    });
};

export const generateBackLink = (fullPage: boolean) => fullPage ? "principle-place-of-business-options" : "certificate-options";

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        const errorList = validate(errors);
        const principlePlaceOption: string = req.body[PRINCIPLE_PLACE_OPTION];
        const isFullPage = req.body.layout === "full";

        if (!errors.isEmpty()) {
            return res.render(LP_CERTIFICATE_PRINCIPLE_PLACE_OPTIONS, {
                ...errorList,
                principlePlaceOption,
                optionFilter: optionFilter,
                isFullPage: isFullPage,
                backLink: generateBackLink(isFullPage)
            });
        };
        const prinPlaceOption: string = req.body[PRINCIPLE_PLACE_OPTION];
        const optionSelected: PrinciplePlaceOfBusinessDetailsRequest = setPrinciplePlaceOption(prinPlaceOption);

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                principlePlaceOfBusinessDetails: optionSelected
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with principle place option, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        req.session?.setExtraData("certificates-orders-web-ch-gov-uk", {
            isFullPage: isFullPage
        } as CertificateSessionData);
        return res.redirect("delivery-details");
    } catch (err) {
        logger.error(`${err}`);
        return next(err);
    }
};

export const setPrinciplePlaceOption = (option: string): PrinciplePlaceOfBusinessDetailsRequest => {
    let initialPrinciplePlaceOption: PrinciplePlaceOfBusinessDetailsRequest = {
        includeAddressRecordsType: null,
        includeDates: false
    };

    switch (option) {
    case PrinciplePlaceOfBusinessOptionName.CURRENT_ADDRESS : {
        initialPrinciplePlaceOption = {
            includeAddressRecordsType: "current",
            includeDates: false
        };
        break;
    }
    case PrinciplePlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS: {
        initialPrinciplePlaceOption = {
            includeAddressRecordsType: "current-and-previous",
            includeDates: false
        };
        break;
    }
    case PrinciplePlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS: {
        initialPrinciplePlaceOption = {
            includeAddressRecordsType: "current-previous-and-prior",
            includeDates: false
        };
        break;
    }
    case PrinciplePlaceOfBusinessOptionName.ALL_CURRENT_AND_PREVIOUS_ADDRESSES: {
        initialPrinciplePlaceOption = {
            includeAddressRecordsType: "all",
            includeDates: false
        };
        break;
    }
    default:
        break;
    }
    return initialPrinciplePlaceOption;
};

export default [...principlePlaceOfBusinessValidationRules, route];
