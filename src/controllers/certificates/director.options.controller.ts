import { NextFunction, Request, Response } from "express";
import { getAccessToken, getUserId } from "../../session/helper";
import { CertificateItem, ItemOptions, DirectorOrSecretaryDetails, DirectorOrSecretaryDetailsRequest, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { CERTIFICATE_DIRECTOR_OPTIONS } from "../../model/template.paths";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import CertificateSessionData from "../../session/CertificateSessionData";
import { getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { mapPageHeader } from "../../utils/page.header.utils";

const logger = createLogger(APPLICATION_NAME);
const INCLUDE_ADDRESS_FIELD: string = "address";
const INCLUDE_APPOINTMENT_DATE_FIELD: string = "appointment";
const INCLUDE_COUNTRY_OF_RESIDENCE_FIELD: string = "countryOfResidence";
const INCLUDE_DOB_TYPE_FIELD: string = "dob";
const INCLUDE_NATIONALITY_FIELD: string = "nationality";
const DIRECTOR_OPTIONS_FIELD: string = "directorOptions";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const basketLink: BasketLink = await getBasketLink(req);
    const itemOptions: ItemOptions = certificateItem.itemOptions;
    const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`;
    const pageHeader = mapPageHeader(req);
    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
    return res.render(CERTIFICATE_DIRECTOR_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
        itemOptions: certificateItem.itemOptions,
        directorDetails: itemOptions.directorDetails,
        SERVICE_URL,
        backLink: setBackLink(certificateItem, req.session),
        ...basketLink,
        ...pageHeader
    });
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const directorOption: string[] | string = req.body[DIRECTOR_OPTIONS_FIELD];
        let directorOptionSelected: DirectorOrSecretaryDetailsRequest;

        if (typeof directorOption === "string") {
            directorOptionSelected = setDirectorOption([directorOption]);
        } else {
            directorOptionSelected = setDirectorOption(directorOption);
        }

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                directorDetails: {
                    ...directorOptionSelected
                }
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with director options, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        if (patchResponse.itemOptions.secretaryDetails?.includeBasicInformation) {
            return res.redirect("secretary-options");
        } else {
            return res.redirect("delivery-options");
        }
    } catch (err) {
        logger.error(`{$err}`);
        return next(err);
    }
};

export const setDirectorOption = (options: string[]): DirectorOrSecretaryDetailsRequest => {
    const initialDirectorOptions: DirectorOrSecretaryDetailsRequest = {
        includeAddress: false,
        includeAppointmentDate: false,
        includeBasicInformation: true,
        includeCountryOfResidence: false,
        includeDobType: null,
        includeNationality: false
    };
    return options === undefined
        ? initialDirectorOptions
        : options.reduce((directorOptionsAccum: DirectorOrSecretaryDetailsRequest, option: string) => {
            switch (option) {
            case INCLUDE_ADDRESS_FIELD: {
                directorOptionsAccum.includeAddress = true;
                break;
            }
            case INCLUDE_APPOINTMENT_DATE_FIELD: {
                directorOptionsAccum.includeAppointmentDate = true;
                break;
            }
            case INCLUDE_COUNTRY_OF_RESIDENCE_FIELD: {
                directorOptionsAccum.includeCountryOfResidence = true;
                break;
            }
            case INCLUDE_DOB_TYPE_FIELD: {
                directorOptionsAccum.includeDobType = "partial";
                break;
            }
            case INCLUDE_NATIONALITY_FIELD: {
                directorOptionsAccum.includeNationality = true;
                break;
            }
            default:
                break;
            }
            return directorOptionsAccum;
        }, initialDirectorOptions);
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined) => {
    let backLink;

    if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        return (session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.isFullPage ? "registered-office-options?layout=full" : "registered-office-options";
    } else {
        backLink = "certificate-options";
    }
    return backLink;
};
