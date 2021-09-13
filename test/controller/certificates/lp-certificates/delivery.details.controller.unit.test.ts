import chai from "chai";

import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink } from "../../../../src/controllers/certificates/lp-certificates/delivery.details.controller";
import { mockDissolvedCertificateItem } from "../../../__mocks__/certificates.mocks";
import { dataEmpty, fullPageFalse, fullPageTrue } from "../../../__mocks__/session.mocks";

describe("delivery.details.controller.unit", () => {
    describe("setBackUrl for no option selected", () => {
        it("the back button link should take the user to the certificate options page", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("certificate-options");
        });
    });

    describe("setBackUrl for only place of business option selected", () => {
        it("should link to the abbreviated place of business option page", () => {
            const certificateItem = {
                itemOptions: {
                    principlePlaceOfBusinessDetails: {
                        includeAddressRecordsType: "current"
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, fullPageFalse)).to.equal("principle-place-of-business-options");
        });
    });

    describe("setBackUrl for only place of business option selected via full page", () => {
        it("should link to the full place of business option page", () => {
            const certificateItem = {
                itemOptions: {
                    principlePlaceOfBusinessDetails: {
                        includeAddressRecordsType: "all"
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, fullPageTrue)).to.equal("principle-place-of-business-options?layout=full");
        });

    });

    describe("setBackUrl for dissolved certificate", () => {
        it("the back button link should take the user to the start page for dissolved certificate", () => {
            const certificateItem = mockDissolvedCertificateItem as CertificateItem;

            chai.expect(setBackLink(mockDissolvedCertificateItem, dataEmpty)).to.include("/orderable/dissolved-certificates");
        });
    });
});
