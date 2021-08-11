import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CERTIFICATE_REGISTERED_OFFICE_OPTIONS } from "../../model/template.paths";
import { CertificateItem, RegisteredOfficeAddressDetailsRequest, CertificateItemPatchRequest, ItemOptions, RegisteredOfficeAddressDetails } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { getAccessToken, getUserId } from "../../session/helper";
import { createLogger } from "ch-structured-logging";
import { registeredOfficeAddressValidationRules, validate } from "../../validation/certificates/registered.office.options.validation";
import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

const REGISTERED_OFFICE_OPTION: string = "registeredOffice";
const CURRENT_ADDRESS_FIELD: string = "currentAddress";
const CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS_FIELD: string = "currentAddressAndTheOnePrevious";
const CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS_FIELD: string = "currentAddressAndTheTwoPrevious";
const ALL_CURRENT_AND_PREVIOUS_ADDRESSES_FIELD: string = "allCurrentAndPreviousAddresses";

const optionFilter = (items) => items.filter((item) => item.display)

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const itemOptions: ItemOptions = certificateItem.itemOptions;
    const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`;

    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

    return res.render(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
        SERVICE_URL,
        optionFilter: optionFilter,
        isFullPage: req.query.layout === "full"
    });
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        const errorList = validate(errors);
        const registeredOfficeOption: string = req.body[REGISTERED_OFFICE_OPTION];

        if (!errors.isEmpty()) {
            return res.render(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, {
                ...errorList,
                registeredOfficeOption,
                optionFilter: optionFilter,
                isFullPage: req.body.layout === "full"
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
        if (patchResponse.itemOptions.directorDetails) {
            return res.redirect("director-options");
        } else if (patchResponse.itemOptions.secretaryDetails) {
            return res.redirect("secretary-options");
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
