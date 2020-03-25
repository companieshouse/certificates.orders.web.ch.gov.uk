import { createApiClient } from "ch-sdk-node";
import {CompanyProfile} from "ch-sdk-node/dist/services/company-profile";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";
import Resource from "ch-sdk-node/dist/services/resource";

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

export const postCertificateItem =
        async (oAuth: string, apiUrl: string, certificateItem: CertificateItemPostRequest) => {
    const api = createApiClient(undefined, oAuth, apiUrl);
    const postCertificateItem: Resource<CertificateItem> = await api.certificate.postCertificate(certificateItem);
    console.log(postCertificateItem);
    return postCertificateItem;
}
