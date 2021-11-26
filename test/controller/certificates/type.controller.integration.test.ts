const chai = require("chai")
import sinon from "sinon";
import ioredis from "ioredis";

import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_TYPE, replaceCertificateId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { dummyCompanyProfileByTypeAndStatus, dummyCompanyProfileDissolvedCompany } from "../../__mocks__/company.profile.mocks";
import { FEATURE_FLAGS } from "../../../src/config/FeatureFlags";

const sandbox = sinon.createSandbox();
let testApp = null;
let postCertificateItemStub;
let postDissolvedCertificateItemStub;
let getCompanyProfileStub;
const COMPANY_NUMBER = "00006500";
const CERTIFICATE_TYPE_URL = replaceCertificateId(CERTIFICATE_TYPE, COMPANY_NUMBER);

describe("type.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("certificate item", () => {
        it("redirects the user to the certificate options page for standard certificate", async () => {
            const certificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes"
                }
            } as CertificateItem;

            postCertificateItemStub = sandbox.stub(apiClient, "postCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            getCompanyProfileStub = sandbox.stub(apiClient, "getCompanyProfile")
                .returns(Promise.resolve(dummyCompanyProfileByTypeAndStatus()));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/certificates/CRT-951616-000712/certificate-options");
        });

        it("redirects user to options page when company status is liquidation and flag enabled", async () => {
            FEATURE_FLAGS.liquidatedCompanyCertficiateEnabled = true;
            const certificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes"
                }
            } as CertificateItem;

            postCertificateItemStub = sandbox.stub(apiClient, "postCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            getCompanyProfileStub = sandbox.stub(apiClient, "getCompanyProfile")
                .returns(Promise.resolve(dummyCompanyProfileByTypeAndStatus({companyType: "ltd", companyStatus: "liquidation"})));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/certificates/CRT-951616-000712/certificate-options");
        })

        it("redirects user to options page when company status is liquidation and flag disabled", async () => {
            FEATURE_FLAGS.liquidatedCompanyCertficiateEnabled = false;
            const certificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes"
                }
            } as CertificateItem;

            postCertificateItemStub = sandbox.stub(apiClient, "postCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            getCompanyProfileStub = sandbox.stub(apiClient, "getCompanyProfile")
                .returns(Promise.resolve(dummyCompanyProfileByTypeAndStatus({companyType: "ltd", companyStatus: "liquidation"})));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(400);
        })
    });

    describe("dissolved certificate item", () => {
        it("redirects the user to the delivery details page for dissolved certificates", async () => {
            const dissolvedCertificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    certificateType: "dissolution"
                }
            } as CertificateItem;

            getCompanyProfileStub = sandbox.stub(apiClient, "getCompanyProfile")
                .returns(Promise.resolve(dummyCompanyProfileDissolvedCompany));
            postDissolvedCertificateItemStub = sandbox.stub(apiClient, "postCertificateItem")
                .returns(Promise.resolve(dissolvedCertificateDetails));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/dissolved-certificates/CRT-951616-000712/delivery-details");
        });
    });
});
