import chai from "chai";
import { setServiceUrl } from "../../src/utils/service.url.utils";
import { mockDissolvedCertificateItem } from "../__mocks__/certificates.mocks";
import { CertificateItem } from "ch-sdk-node/dist/services/order/certificates/types";

const certificateItem: CertificateItem = mockDissolvedCertificateItem;

describe("service.url.utils", () => {
    it("should set service url to orderable/dissolved-certificates", () => {
        const dissolvedCertificateServiceUrl = setServiceUrl(certificateItem);
        chai.expect(dissolvedCertificateServiceUrl).to.equal(`/company/${certificateItem.companyNumber}/orderable/dissolved-certificates`);
    });

    it("should set service url to orderable/certificates", () => {
        certificateItem.itemOptions.certificateType = "incorporation-with-all-name-changes";
        const certificateServiceUrl = setServiceUrl(certificateItem);
        chai.expect(certificateServiceUrl).to.equal(`/company/${certificateItem.companyNumber}/orderable/certificates`);
    });
});
