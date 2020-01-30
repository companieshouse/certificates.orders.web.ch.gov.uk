import {NextFunction, Request, Response} from "express";
import {check, validationResult} from "express-validator";
import {createGovUkErrorData, GovUkErrorData} from "../model/govuk.error.data";
import * as errorMessages from "../model/error.messages";
import * as templatePaths from "../model/template.paths";

const validators = [
    check("collectionOffice").not().isEmpty().withMessage(errorMessages.COLLECTION_OFFICE),
];

const route = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorText = errors.array().map((err) => err.msg).pop() as string;
        const collectionErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#collection-office", true, "");

        return res.render(templatePaths.COLLECTION, {
            collectionErr: collectionErrorData,
            errorList: [collectionErrorData],
            templateName: (templatePaths.COLLECTION),
        });
    }
    res.redirect(templatePaths.CHECK_DETAILS);
};

export default [...validators, route];
