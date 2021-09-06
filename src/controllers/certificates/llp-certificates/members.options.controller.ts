import {NextFunction, Request, Response} from "express";
import {getAccessToken, getUserId} from "../../../session/helper";
import {
    CertificateItem,
    ItemOptions,
    CertificateItemPatchRequest,
    OrdinaryMemberDetailsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {getCertificateItem, patchCertificateItem} from "../../../client/api.client";
import {createLogger} from "ch-structured-logging";
import {APPLICATION_NAME} from "../../../config/config";
import {Session} from "@companieshouse/node-session-handler/lib/session/model/Session";
import CertificateSessionData from "../../../session/CertificateSessionData";

import {replaceCompanyNumber, LLP_ROOT_CERTIFICATE, LLP_CERTIFICATE_MEMBERS_OPTIONS} from "../../../model/page.urls";
import {MembersOptionName} from "./MembersOptionName";

const logger = createLogger(APPLICATION_NAME);
const MEMBERS_OPTIONS_FIELD: string = "membersOptions";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const itemOptions: ItemOptions = certificateItem.itemOptions;
    const SERVICE_URL = replaceCompanyNumber(LLP_ROOT_CERTIFICATE, certificateItem.companyNumber)
    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
    return res.render(LLP_xCERTIFICATE_MEMBERS_OPTIONS, {
        memberDetails: itemOptions.memberDetails,
        SERVICE_URL,
        backLink: setBackLink(certificateItem, req.session)
    });
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const membersOption: string[] | string = req.body[MEMBERS_OPTIONS_FIELD];
        let membersOptionSelected: OrdinaryMemberDetailsRequest;

        if (typeof membersOption === "string") {
            membersOptionSelected = setMembersOption([membersOption]);
        } else {
            membersOptionSelected = setMembersOption(membersOption);
        }

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                memberDetails: {
                    ...membersOptionSelected
                }
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with member options, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        return res.redirect("delivery-details");
    } catch (err) {
        logger.error(`{$err}`);
        return next(err);
    }
};

export const setMembersOption = (options: string[]): OrdinaryMemberDetailsRequest => {
    const initialMembersOptions: OrdinaryMemberDetailsRequest = {
        includeAddress: false,
        includeAppointmentDate: false,
        includeBasicInformation: true,
        includeCountryOfResidence: false,
        includeDobType: null
    };
    return options === undefined ? initialMembersOptions
        : options.reduce((memberOptionAccum: OrdinaryMemberDetailsRequest, option: string) => {
            switch (option) {
                case MembersOptionName.INCLUDE_ADDRESS: {
                    memberOptionAccum.includeAddress = true;
                    break;
                }
                case MembersOptionName.INCLUDE_APPOINTMENT_DATE: {
                    memberOptionAccum.includeAppointmentDate = true;
                    break;
                }
                case MembersOptionName.INCLUDE_COUNTRY_OF_RESIDENCE: {
                    memberOptionAccum.includeCountryOfResidence = true;
                    break;
                }
                case MembersOptionName.INCLUDE_DOB_TYPE: {
                    memberOptionAccum.includeDobType = "partial";
                    break;
                }
                default:
                    break;
            }
            return memberOptionAccum;
        }, initialMembersOptions);
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined) => {
    let backLink;
    if (certificateItem.itemOptions?.designatedMemberDetails?.includeBasicInformation) {
        backLink = "llp-designated-member-options";
    } else if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        backLink = (session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.isFullPage ? "registered-office-options?layout=full" : "registered-office-options";
    } else {
        backLink = "llp-certificate-options";
    }
    return backLink;
};
