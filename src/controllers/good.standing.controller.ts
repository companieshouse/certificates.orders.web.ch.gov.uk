import {NextFunction, Request, Response} from "express";
import {check, validationResult} from "express-validator";
import {createGovUkErrorData, GovUkErrorData} from "../model/govuk.error.data";
import * as pageUrls from "../model/page.urls";
import * as errorMessages from "../model/error.messages";

const validators = [
    check("goodStanding").not().isEmpty().withMessage(errorMessages.GOOD_STANDING_OPTION_NOT_SELECTED),
  ];

const route = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorText = errors.array().map((err) => err.msg).pop() as string;
        const goodStandingErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#good-standing", true, "");

        return res.render("good-standing", {
            errorList: [goodStandingErrorData],
            goodStandingErr: goodStandingErrorData,
            templateName: ("good-standing"),
        });
    }
    res.redirect(pageUrls.GOOD_STANDING);
};

export default [...validators, route];
