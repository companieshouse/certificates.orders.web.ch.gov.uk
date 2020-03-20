import { createApiClient } from "ch-sdk-node";
import {CompanyProfile} from "ch-sdk-node/dist/services/company-profile";

export const getCompanyProfile = async (companyNumber: string, oAuth: string, apiUrl: string) => {
    const api = createApiClient(undefined, oAuth, apiUrl);
    const profile = await api.companyProfile.getCompanyProfile(companyNumber);

    console.log(profile);

    const sdkResponse =
        await api.companyProfile.getCompanyProfile(companyNumber.toUpperCase());

    const companyProfile = sdkResponse.resource as CompanyProfile;

    return {
        companyName: companyProfile.companyName,
    };
};
