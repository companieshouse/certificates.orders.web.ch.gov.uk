import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CERTIFICATE_REGISTERED_OFFICE_OPTIONS } from "../../model/template.paths";
import { RegisteredOfficeAddressDetailsRequest, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { patchCertificateItem } from "../../client/api.client";
import { getAccessToken, getUserId } from "../../session/helper";
import { createLogger } from "ch-structured-logging";
import { registeredOfficeAddressValidationRules, validate } from "../../validation/certificates/registered.office.options.validation";
import { APPLICATION_NAME } from "../../config/config";
import CertificateSessionData from "../../session/CertificateSessionData";
import { renderRegisteredOfficeOptions, generateBackLink} from "../../service/registered.office.options.service";

const logger = createLogger(APPLICATION_NAME);

const REGISTERED_OFFICE_OPTION: string = "registeredOffice";
const CURRENT_ADDRESS_FIELD: string = "currentAddress";
const CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS_FIELD: string = "currentAddressAndTheOnePrevious";
const CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS_FIELD: string = "currentAddressAndTheTwoPrevious";
const ALL_CURRENT_AND_PREVIOUS_ADDRESSES_FIELD: string = "allCurrentAndPreviousAddresses";

export const optionFilter = (items) => items.filter((item) => item.display);

export const render = async (req: Request, res: Response): Promise<void> => {
    renderRegisteredOfficeOptions(req, res, false, CERTIFICATE_REGISTERED_OFFICE_OPTIONS, optionFilter)
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        const errorList = validate(errors);
        const registeredOfficeOption: string = req.body[REGISTERED_OFFICE_OPTION];
        const isFullPage = req.body.layout === "full";

        if (!errors.isEmpty()) {
            return res.render(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, {
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
        if (patchResponse.itemOptions.directorDetails?.includeBasicInformation) {
            return res.redirect("director-options");
        } else if (patchResponse.itemOptions.secretaryDetails?.includeBasicInformation) {
            return res.redirect("secretary-options");
        } else {
            return res.redirect("delivery-options");
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
    case CURRENT_ADDRESS_FIELD: {
        initialRegOfficeOption = {
            includeAddressRecordsType: "current",
            includeDates: false
        };
        break;
    }
    case CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS_FIELD: {
        initialRegOfficeOption = {
            includeAddressRecordsType: "current-and-previous",
            includeDates: false
        };
        break;
    }
    case CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS_FIELD: {
        initialRegOfficeOption = {
            includeAddressRecordsType: "current-previous-and-prior",
            includeDates: false
        };
        break;
    }
    case ALL_CURRENT_AND_PREVIOUS_ADDRESSES_FIELD: {
        initialRegOfficeOption = {
            includeAddressRecordsType: "all",
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
