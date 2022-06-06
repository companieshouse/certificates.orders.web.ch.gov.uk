import chai from "chai";

import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink } from "../../../src/controllers/certificates/delivery.details.controller";
import { mockDissolvedCertificateItem } from "../../__mocks__/certificates.mocks";
import { dataEmpty, fullPageFalse, fullPageTrue } from "../../__mocks__/session.mocks";

describe("delivery.details.controller.unit", () => {

    describe("setBackUrl for certificate", () => {
        it("the back button link should take the user to the delivery options page", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("delivery-options");
        });
    });

    describe("setBackUrl for dissolved certificate", () => {
        it("the back button link should take the user to the start page for dissolved certificate", () => {
            const certificateItem = mockDissolvedCertificateItem as CertificateItem;

            chai.expect(setBackLink(mockDissolvedCertificateItem, dataEmpty)).to.include("/orderable/dissolved-certificates");
        });
    });
});
