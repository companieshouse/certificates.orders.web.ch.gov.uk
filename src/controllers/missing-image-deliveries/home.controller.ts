import { Request, Response } from "express";
import { MISSING_IMAGE_DELIVERY_INDEX } from "../../model/template.paths";
import { MISSING_IMAGE_DELIVERY_CREATE, replaceCompanyNumberAndFilingHistoryId } from "../../model/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { getCompanyProfile } from "../../client/api.client";
import { API_KEY } from "../../config/config";

export default async (req: Request, res: Response) => {
    const companyNumber: string = req.params.companyNumber;
    const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
    const companyName : string = companyProfile.companyName;
    const filingHistoryId: string = req.params.filingHistoryId;
    const startNowUrl: string = replaceCompanyNumberAndFilingHistoryId(MISSING_IMAGE_DELIVERY_CREATE, companyNumber, filingHistoryId);
    const SERVICE_URL = `/company/${companyNumber}/filing-history`;

    res.render(MISSING_IMAGE_DELIVERY_INDEX, { companyNumber, startNowUrl, SERVICE_URL, companyName });
};
