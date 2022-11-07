import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS } from "../../../model/template.paths";
import { CertificateItem, CertificateItemPatchRequest, ItemOptions, PrincipalPlaceOfBusinessDetailsRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../../../client/api.client";
import { getAccessToken, getUserId } from "../../../session/helper";
import { createLogger } from "ch-structured-logging";
import { principalPlaceOfBusinessValidationRules, validate } from "../../../validation/lp-certificates/principal.place.options.validation";
import { APPLICATION_NAME } from "../../../config/config";
import CertificateSessionData from "../../../session/CertificateSessionData";
import { PrincipalPlaceOfBusinessOptionName } from "./PrincipalPlaceOfBusinessOptionName";
import { LP_ROOT_CERTIFICATE, replaceCompanyNumber } from "../../../model/page.urls";
import { AddressRecordsType } from "../../../model/AddressRecordsType";
import { getBasketLink } from "../../../utils/basket.utils";
import { BasketLink } from "../../../model/BasketLink";

const logger = createLogger(APPLICATION_NAME);

const PRINCIPAL_PLACE_OPTION: string = "principalPlace";

export const optionFilter = (items) => items.filter((item) => item.display);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const itemOptions: ItemOptions = certificateItem.itemOptions;
    const SERVICE_URL = replaceCompanyNumber(LP_ROOT_CERTIFICATE, certificateItem.companyNumber);
    const isFullPage = req.query.layout === "full";
    const basketLink: BasketLink = await getBasketLink(req);

    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

    return res.render(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
        SERVICE_URL,
        optionFilter: optionFilter,
        isFullPage: isFullPage,
        backLink: generateBackLink(isFullPage),
        principlePlaceOfBusinessSelection: itemOptions.principalPlaceOfBusinessDetails?.includeAddressRecordsType,
        ...basketLink
    });
};

export const generateBackLink = (fullPage: boolean) => fullPage ? "principal-place-of-business-options" : "certificate-options";

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        const errorList = validate(errors);
        const principalPlaceOption: string = req.body[PRINCIPAL_PLACE_OPTION];
        const isFullPage = req.body.layout === "full";

        if (!errors.isEmpty()) {
            return res.render(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, {
                ...errorList,
                principalPlaceOption: principalPlaceOption,
                optionFilter: optionFilter,
                isFullPage: isFullPage,
                backLink: generateBackLink(isFullPage)
            });
        };
        const prinPlaceOption: string = req.body[PRINCIPAL_PLACE_OPTION];
        const optionSelected: PrincipalPlaceOfBusinessDetailsRequest = setPrincipalPlaceOption(prinPlaceOption);

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                principalPlaceOfBusinessDetails: optionSelected
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with principal place option, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        req.session?.setExtraData("certificates-orders-web-ch-gov-uk", {
            isFullPage: isFullPage
        } as CertificateSessionData);
        return res.redirect("delivery-options");
    } catch (err) {
        logger.error(`${err}`);
        return next(err);
    }
};

export const setPrincipalPlaceOption = (option: string): PrincipalPlaceOfBusinessDetailsRequest => {
    let initialPrincipalPlaceOption: PrincipalPlaceOfBusinessDetailsRequest = {
        includeAddressRecordsType: null,
        includeDates: false
    };

    switch (option) {
    case PrincipalPlaceOfBusinessOptionName.CURRENT_ADDRESS : {
        initialPrincipalPlaceOption = {
            includeAddressRecordsType: AddressRecordsType.CURRENT,
            includeDates: false
        };
        break;
    }
    case PrincipalPlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS: {
        initialPrincipalPlaceOption = {
            includeAddressRecordsType: AddressRecordsType.CURRENT_AND_PREVIOUS,
            includeDates: false
        };
        break;
    }
    case PrincipalPlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS: {
        initialPrincipalPlaceOption = {
            includeAddressRecordsType: AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR,
            includeDates: false
        };
        break;
    }
    case PrincipalPlaceOfBusinessOptionName.ALL_CURRENT_AND_PREVIOUS_ADDRESSES: {
        initialPrincipalPlaceOption = {
            includeAddressRecordsType: AddressRecordsType.ALL,
            includeDates: false
        };
        break;
    }
    default:
        break;
    }
    return initialPrincipalPlaceOption;
};

export default [...principalPlaceOfBusinessValidationRules, route];
