import {createApiClient} from "ch-sdk-node";
import Resource from "ch-sdk-node/dist/services/resource";
import {CertificateItem, CertificateItemRequest} from "ch-sdk-node/dist/services/order/item/certificate";

(async () => {
    const api = createApiClient(undefined, "5MiYQ0o9VIIQxsF9yl49Ws75Lnq-3ZCc9Cx4_iVB49c5xsXpRdt2mSgegQ7WACUNGDz4baGrr7HIESoa7hPS_g", "http://api.chs-dev.internal:4001");
    const sdkResponse = await api.companyProfile.getCompanyProfile("00006400");
    //const cert: Resource<CertificateItem> = await api.certificate.getCertificate("CHS00000000000000001");
    //console.log(JSON.stringify(cert, null, 2));

    const c: CertificateItemRequest = {
        companyNumber: "00006400",
        itemOptions: {},
        quantity: 1,
    };
    const createdCert: Resource<CertificateItem> = await api.certificate.postCertificate(c);
    console.log(JSON.stringify(createdCert, null, 2));
})();
