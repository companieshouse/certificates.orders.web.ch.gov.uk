import chai from "chai";

import { CertificateItem } from "ch-sdk-node/dist/services/order/certificates/types";
import { setBackLink } from "../../../src/controllers/certificates/delivery.details.controller";
import { mockDissolvedCertificateItem } from "../../__mocks__/certificates.mocks";

describe("delivery.details.controller.unit", () => {
    describe("setBackUrl for no registered address option selected", () => {
        it("the back button link should take the user to the certificate options page", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem)).to.equal("certificate-options");
        });
    });

    describe("setBackUrl for registered office option selected", () => {
        it("the back button link should take the user to the registered office option page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem)).to.equal("registered-office-options");
        });
    });

    describe("setBackUrl for dissolved certificate", () => {
        it("the back button link should take the user to the start page for dissolved certificate", () => {
            const certificateItem = mockDissolvedCertificateItem as CertificateItem;

            chai.expect(setBackLink(mockDissolvedCertificateItem)).to.include("/orderable/dissolved-certificates");
        });
    });
});
