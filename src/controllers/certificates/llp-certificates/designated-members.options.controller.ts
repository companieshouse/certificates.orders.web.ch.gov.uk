import { NextFunction, Request, Response } from "express";
import { getAccessToken, getUserId } from "../../../session/helper";
import { CertificateItem, ItemOptions, CertificateItemPatchRequest, DesignatedMemberDetailsRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../../../client/api.client";
import { LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS } from "../../../model/template.paths";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../../config/config";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import CertificateSessionData from "../../../session/CertificateSessionData";
import { DesignatedMemberOptionName } from "./DesignatedMemberOptionName";
import { replaceCompanyNumber, LLP_ROOT_CERTIFICATE } from "../../../model/page.urls";
import { getBasketLink } from "../../../utils/basket.utils";
import { BasketLink } from "../../../model/BasketLink";
import { mapPageHeader } from "../../../utils/page.header.utils";

const logger = createLogger(APPLICATION_NAME);
const DESIGNATED_MEMBER_OPTIONS_FIELD: string = "designatedMemberOptions";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const itemOptions: ItemOptions = certificateItem.itemOptions;
    const basketLink: BasketLink = await getBasketLink(req);
    const pageHeader = mapPageHeader(req);
    const SERVICE_URL = replaceCompanyNumber(LLP_ROOT_CERTIFICATE, certificateItem.companyNumber);
    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
    return res.render(LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, {
        designatedMemberDetails: itemOptions.designatedMemberDetails,
        SERVICE_URL,
        backLink: setBackLink(certificateItem, req.session),
        ...basketLink,
        ...pageHeader
    });
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const designatedMemberOption: string[] | string = req.body[DESIGNATED_MEMBER_OPTIONS_FIELD];
        let designatedMemberOptionSelected: DesignatedMemberDetailsRequest;

        if (typeof designatedMemberOption === "string") {
            designatedMemberOptionSelected = setDesignatedMemberOption([designatedMemberOption]);
        } else {
            designatedMemberOptionSelected = setDesignatedMemberOption(designatedMemberOption);
        }

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                designatedMemberDetails: {
                    ...designatedMemberOptionSelected
                }
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with designated member options, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        if (patchResponse.itemOptions.memberDetails?.includeBasicInformation) {
            return res.redirect("members-options");
        } else {
            return res.redirect("delivery-options");
        }
    } catch (err) {
        logger.error(`{$err}`);
        return next(err);
    }
};

export const setDesignatedMemberOption = (options: string[]): DesignatedMemberDetailsRequest => {
    const initialDesignatedMemberOptions: DesignatedMemberDetailsRequest = {
        includeAddress: false,
        includeAppointmentDate: false,
        includeBasicInformation: true,
        includeCountryOfResidence: false,
        includeDobType: null
    };
    return options === undefined ? initialDesignatedMemberOptions
        : options.reduce((designMemberOptionAccum: DesignatedMemberDetailsRequest, option: string) => {
            switch (option) {
            case DesignatedMemberOptionName.INCLUDE_ADDRESS: {
                designMemberOptionAccum.includeAddress = true;
                break;
            }
            case DesignatedMemberOptionName.INCLUDE_APPOINTMENT_DATE: {
                designMemberOptionAccum.includeAppointmentDate = true;
                break;
            }
            case DesignatedMemberOptionName.INCLUDE_COUNTRY_OF_RESIDENCE: {
                designMemberOptionAccum.includeCountryOfResidence = true;
                break;
            }
            case DesignatedMemberOptionName.INCLUDE_DOB_TYPE: {
                designMemberOptionAccum.includeDobType = "partial";
                break;
            }
            default:
                break;
            }
            return designMemberOptionAccum;
        }, initialDesignatedMemberOptions);
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined) => {
    let backLink;

    if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        backLink = (session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.isFullPage ? "registered-office-options?layout=full" : "registered-office-options";
    } else {
        backLink = "certificate-options";
    }
    return backLink;
};
