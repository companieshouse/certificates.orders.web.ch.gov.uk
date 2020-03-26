import {createApiClient} from "ch-sdk-node";
import Resource from "ch-sdk-node/dist/services/resource";
import {CertificateItem, CertificateItemPostRequest, ItemOptionsRequest, ItemOptions, CertificateItemPatchRequest} from "ch-sdk-node/dist/services/order/item/certificate";

(async () => {
    const api = createApiClient(undefined, "QyaGhZblxG3lGC-Oen9Kdnid08ANq03izUQDwXVFBtXoThZQ_2E_mSS_Zm71_Fq0ttQU4i2bCJXboBk2hlOo9w", "http://api.chs-dev.internal:4001");
    const sdkResponse = await api.companyProfile.getCompanyProfile("00006400");
    //const cert: Resource<CertificateItem> = await api.certificate.getCertificate("CHS00000000000000001");
    //console.log(JSON.stringify(cert, null, 2));

    // const c: CertificateItemPostRequest = {
    //     companyNumber: "00006400",
    //     itemOptions: {
    //         certificateType: "incorporation",
    //     },
    //     quantity: 1,
    // };
    // const createdCert: Resource<CertificateItem> = await api.certificate.postCertificate(c);
    // console.log(JSON.stringify(createdCert, null, 2));

    api.client.header("Content-Type", "application/merge-patch+json")
    const c: CertificateItemPatchRequest = {
        companyNumber: "00006400",
        itemOptions: {
            certificateType: "incorporation",
        },
        quantity: 1,
    };
    const createdCert: Resource<CertificateItem> = await api.certificate.patchCertificate(c, "CHS00000000000000001");
    console.log(JSON.stringify(createdCert, null, 2));
})();
