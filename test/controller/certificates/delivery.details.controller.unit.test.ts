import chai from "chai";

import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink } from "../../../src/utils/delivery.details.utils";
import { mockDissolvedCertificateItem } from "../../__mocks__/certificates.mocks";

describe("delivery.details.controller.unit", () => {
    describe("setBackUrl for certificate", () => {
        it("the back button link should take the user to the delivery options page", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem)).to.equal("delivery-options");
        });
        it("the back button link should take the user to the email options page", () => {
            const certificateItem = {
                itemOptions: {
                    deliveryTimescale: "same-day"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem)).to.equal("email-options");
        });
    });

    describe("setBackUrl for dissolved certificate", () => {
        const certificateItem = mockDissolvedCertificateItem as CertificateItem;

        it("the back button link should take the user to the email options page for same-day delivery option", () => {
            chai.expect(setBackLink(certificateItem)).to.equal("email-options");
        });

        it("the back button link should take the user to the delivery options page for standard delivery option", () => {
            mockDissolvedCertificateItem.itemOptions.deliveryTimescale = "standard";
            mockDissolvedCertificateItem.itemOptions.includeEmailCopy = false;

            chai.expect(setBackLink(certificateItem)).to.equal("delivery-options");
        });
    });
});
