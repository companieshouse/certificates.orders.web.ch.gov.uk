import {createApiClient} from "ch-sdk-node";
import Resource from "ch-sdk-node/dist/services/resource";
import {CertificateItem, CertificateItemPostRequest, ItemOptionsRequest, ItemOptions} from "ch-sdk-node/dist/services/order/item/certificate";

(async () => {
    const api = createApiClient(undefined, "yK25e5lz8GwKZZ7Q903Brc-TxGB-ZFqeDiAKcL8FyFH_zf44Qp0Phkaqe7Ut-MJJbPDUgkAZ_rKZqu-0AvaYkQ", "http://api.chs-dev.internal:4001");
    const sdkResponse = await api.companyProfile.getCompanyProfile("00006400");
    //const cert: Resource<CertificateItem> = await api.certificate.getCertificate("CHS00000000000000001");
    //console.log(JSON.stringify(cert, null, 2));

    const c: CertificateItemPostRequest = {
        companyNumber: "00006400",
        itemOptions: {
            certificateType: "incorporation",
        },
        quantity: 1,
    };
    const createdCert: Resource<CertificateItem> = await api.certificate.postCertificate(c);
    console.log(JSON.stringify(createdCert, null, 2));
})();
