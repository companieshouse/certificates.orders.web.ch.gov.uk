import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS } from "../../../model/template.paths";
import { CertificateItem, RegisteredOfficeAddressDetailsRequest, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../../../client/api.client";
import { getAccessToken, getUserId } from "../../../session/helper";
import { createLogger } from "ch-structured-logging";
import { registeredOfficeAddressValidationRules, validate } from "../../../validation/certificates/registered.office.options.validation";
import { APPLICATION_NAME } from "../../../config/config";
import CertificateSessionData from "../../../session/CertificateSessionData";
import { RegisteredOfficeAddressOptionName } from "./RegisteredOfficeAddressOptionName"
import {AddressRecordsType} from "../../../model/AddressRecordsType";

const logger = createLogger(APPLICATION_NAME);

const REGISTERED_OFFICE_OPTION: string = "registeredOffice";

export const optionFilter = (items) => items.filter((item) => item.display)

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/llp-certificates`;
    const isFullPage = req.query.layout === "full";

    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

    return res.render(LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
        SERVICE_URL,
        optionFilter: optionFilter,
        isFullPage: isFullPage,
        backLink: generateBackLink(isFullPage),
        roaSelection: certificateItem.itemOptions.registeredOfficeAddressDetails?.includeAddressRecordsType
    });
};

export const generateBackLink = (fullPage: boolean) => fullPage ? "registered-office-options" : "certificate-options";

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        const errorList = validate(errors);
        const registeredOfficeOption: string = req.body[REGISTERED_OFFICE_OPTION];
        const isFullPage = req.body.layout === "full";

        if (!errors.isEmpty()) {
            return res.render(LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS, {
                ...errorList,
                registeredOfficeOption,
                optionFilter: optionFilter,
                isFullPage: isFullPage,
                backLink: generateBackLink(isFullPage)
            });
        };
        const regOfficeOption: string = req.body[REGISTERED_OFFICE_OPTION];
        const optionSelected: RegisteredOfficeAddressDetailsRequest = setRegOfficeOption(regOfficeOption);

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                registeredOfficeAddressDetails: optionSelected
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with registered office option, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        req.session?.setExtraData("certificates-orders-web-ch-gov-uk", {
            isFullPage: isFullPage
        } as CertificateSessionData);
        if (patchResponse.itemOptions.designatedMemberDetails) {
            return res.redirect("designated-members-options");
        } else if (patchResponse.itemOptions.memberDetails) {
            return res.redirect("members-options");
        } else {
            return res.redirect("delivery-details");
        }
    } catch (err) {
        logger.error(`${err}`);
        return next(err);
    }
};

export const setRegOfficeOption = (option: string): RegisteredOfficeAddressDetailsRequest => {
    let initialRegOfficeOption: RegisteredOfficeAddressDetailsRequest = {
        includeAddressRecordsType: null,
        includeDates: false
    };

    switch (option) {
    case RegisteredOfficeAddressOptionName.CURRENT_ADDRESS: {
        initialRegOfficeOption = {
            includeAddressRecordsType: AddressRecordsType.CURRENT,
            includeDates: false
        };
        break;
    }
    case RegisteredOfficeAddressOptionName.CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS: {
        initialRegOfficeOption = {
            includeAddressRecordsType: AddressRecordsType.CURRENT_AND_PREVIOUS,
            includeDates: false
        };
        break;
    }
    case RegisteredOfficeAddressOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS: {
        initialRegOfficeOption = {
            includeAddressRecordsType: AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR,
            includeDates: false
        };
        break;
    }
    case RegisteredOfficeAddressOptionName.ALL_CURRENT_AND_PREVIOUS_ADDRESSES: {
        initialRegOfficeOption = {
            includeAddressRecordsType: AddressRecordsType.ALL,
            includeDates: false
        };
        break;
    }
    default:
        break;
    }
    return initialRegOfficeOption;
};

export default [...registeredOfficeAddressValidationRules, route];