import { LocalesService } from "@companieshouse/ch-node-utils";
import { Request, Response, NextFunction } from "express";
import { LOCALES_ENABLED, LOCALES_PATH } from "../config/config";

const locales = LocalesService.getInstance(LOCALES_PATH, LOCALES_ENABLED);

interface LangRequest extends Request {
    lang?: string
}

function getRequestLanguage(req: LangRequest) {
    if(!LOCALES_ENABLED) {
        return 'en';
    }

    if (req.lang) {
        return req.lang;
    }

    return 'en';
}

const translationsMiddleware = (req: LangRequest, res: Response, next: NextFunction) => {
    // Do this only on GET requests, we don't care about translations if we're not showing the user any content.
    if (req.method !== 'GET') {
        next();
        return;
    }

    // This loads all of the .json locale files for a given language into res.locals
    // They can then be used in templates
    const lang = getRequestLanguage(req);
    const locale = locales.i18nCh.resolveNamespacesKeys(lang);

    Object.assign(res.locals, {
        lang: locale,
    });

    next();
};

export default translationsMiddleware;