import { check } from "express-validator";
import * as errorMessages from "../../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";

const PRINCIPAL_PLACE_OPTION: string = "principalPlace";

export const principalPlaceOfBusinessValidationRules =
    [
        check(PRINCIPAL_PLACE_OPTION)
            .not().isEmpty().withMessage(errorMessages.PRINCIPAL_PLACE_OPTION_NOT_SELECTED)
    ];

export const validate = (validationErrors) => {
    let principalPlaceOptionError;

    const validationErrorList = validationErrors.array({ onlyFirstError: true }).map((error) => {
        const govUkErrorData: GovUkErrorData = createGovUkErrorData(error.msg, "#" + error.param, true, "");

        if (error.param === PRINCIPAL_PLACE_OPTION) {
            principalPlaceOptionError = govUkErrorData;
        }
        return govUkErrorData;
    });

    return {
        errorList: validationErrorList,
        principalPlaceOptionError
    };
};
