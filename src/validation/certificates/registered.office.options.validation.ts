import { check } from "express-validator";
import * as errorMessages from "../../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";

const REGISTERED_OFFICE_OPTION: string = "registeredOffice";

export const registeredOfficeAddressValidationRules =
    [
        check(REGISTERED_OFFICE_OPTION)
            .not().isEmpty().withMessage(errorMessages.REGISTERED_OFFICE_OPTION_NOT_SELECTED)
    ];

export const validate = (validationErrors) => {
    let registeredOfficeOptionError;

    const validationErrorList = validationErrors.array({ onlyFirstError: true }).map((error) => {
        const govUkErrorData: GovUkErrorData = createGovUkErrorData(error.msg, "#" + error.param, true, "");

        if (error.param === REGISTERED_OFFICE_OPTION) {
            registeredOfficeOptionError = govUkErrorData;
        }
        return govUkErrorData;
    });

    return {
        errorList: validationErrorList,
        registeredOfficeOptionError
    };
};
