import { NextFunction, Request, Response } from "express";
import { getAccessToken, getUserId } from "../../session/helper";
import { getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { CERTIFICATE_SECRETARY_OPTIONS } from "../../model/template.paths";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import { DirectorOrSecretaryDetailsRequest, CertificateItemPatchRequest, CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import CertificateSessionData from "../../session/CertificateSessionData";
import { getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { mapPageHeader } from "../../utils/page.header.utils";

const INCLUDE_ADDRESS_FIELD: string = "address";
const INCLUDE_APPOINTMENT_DATE_FIELD: string = "appointment";
const SECRETARY_OPTIONS_FIELD: string = "secretaryOptions";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const basketLink: BasketLink = await getBasketLink(req);
    const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`;
    const backLink = setBackLink(certificateItem, req.session);
    const pageHeader = mapPageHeader(req);

    return res.render(CERTIFICATE_SECRETARY_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
        backLink,
        secretaryDetails: certificateItem.itemOptions?.secretaryDetails,
        SERVICE_URL,
        ...basketLink,
        ...pageHeader
    });
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const secretaryOption: string[] | string = req.body[SECRETARY_OPTIONS_FIELD];
        let secretaryOptionSelected: DirectorOrSecretaryDetailsRequest;

        if (typeof secretaryOption === "string") {
            secretaryOptionSelected = setSecretaryOption([secretaryOption]);
        } else {
            secretaryOptionSelected = setSecretaryOption(secretaryOption);
        }

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                secretaryDetails: {
                    ...secretaryOptionSelected
                }
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with secretary options, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        return res.redirect("delivery-options");
    } catch (err) {
        logger.error(`{$err}`);
        return next(err);
    }
};

export const setSecretaryOption = (options: string[]): DirectorOrSecretaryDetailsRequest => {
    const initialSecretaryOptions: DirectorOrSecretaryDetailsRequest = {
        includeAddress: false,
        includeAppointmentDate: false,
        includeBasicInformation: true
    };
    return options === undefined ? initialSecretaryOptions
        : options.reduce((secretaryOptionsAccum: DirectorOrSecretaryDetailsRequest, option: string) => {
            switch (option) {
            case INCLUDE_ADDRESS_FIELD: {
                secretaryOptionsAccum.includeAddress = true;
                break;
            }
            case INCLUDE_APPOINTMENT_DATE_FIELD: {
                secretaryOptionsAccum.includeAppointmentDate = true;
                break;
            }
            default:
                break;
            }
            return secretaryOptionsAccum;
        }, initialSecretaryOptions);
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined) => {
    let backLink;
    if (certificateItem.itemOptions?.directorDetails?.includeBasicInformation) {
        backLink = "director-options";
    } else if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        return (session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.isFullPage ? "registered-office-options?layout=full" : "registered-office-options";
    } else {
        backLink = "certificate-options";
    }
    return backLink;
};
