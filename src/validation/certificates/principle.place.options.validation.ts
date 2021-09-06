import { check } from "express-validator";
import * as errorMessages from "../../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";

const PRINCIPLE_PLACE_OPTION: string = "principlePlace";

export const principlePlaceOfBusinessValidationRules =
    [
        check(PRINCIPLE_PLACE_OPTION)
            .not().isEmpty().withMessage(errorMessages.PRINCIPLE_PLACE_OPTION_NOT_SELECTED)
    ];

export const validate = (validationErrors) => {
    let principlePlaceOptionError;

    const validationErrorList = validationErrors.array({ onlyFirstError: true }).map((error) => {
        const govUkErrorData: GovUkErrorData = createGovUkErrorData(error.msg, "#" + error.param, true, "");

        if (error.param === PRINCIPLE_PLACE_OPTION) {
            principlePlaceOptionError = govUkErrorData;
        }
        return govUkErrorData;
    });

    return {
        errorList: validationErrorList,
        principlePlaceOptionError
    };
};
