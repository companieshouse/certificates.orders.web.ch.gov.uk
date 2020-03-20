import {createApiClient} from "ch-sdk-node";
import Resource from "ch-sdk-node/dist/services/resource";
import {CertificateItem} from "ch-sdk-node/dist/services/order/item/certificate";

(async () => {
    const api = createApiClient(undefined, "AnnEPL4YhQc5TyzZB9-9Ze_LtpPQCARqh0QbOi46Da1ZlznDGvElOPeYFrcHekStNaJjqj2epF0pZhWXQSuyXA", "http://api.chs-dev.internal:4001");
    const sdkResponse =
        await api.companyProfile.getCompanyProfile("00006400");
        //console.log(sdkResponse);
    const profile: Resource<CertificateItem> = await api.certificate.getCertificate("CHS00000000000000001");

    console.log(profile);
})();
