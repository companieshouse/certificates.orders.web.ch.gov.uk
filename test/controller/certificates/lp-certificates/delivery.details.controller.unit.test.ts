import chai from "chai";

import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink } from "../../../../src/controllers/certificates/lp-certificates/delivery.details.controller";
import { mockDissolvedCertificateItem } from "../../../__mocks__/certificates.mocks";
import { dataEmpty, fullPageFalse, fullPageTrue } from "../../../__mocks__/session.mocks";

describe("lp.delivery.details.controller.unit", () => {
    describe("setBackUrl for  delivery timescale option selected", () => {
        it("the back button link should take the user to the delivery options page when standard delivery is selected", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith",
                    deliveryTimescale: "standard"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem)).to.equal("delivery-options");
        });
        it("the back button link should take the user to the email options page when express delivery is selected", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith",
                    deliveryTimescale: "same-day"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem)).to.equal("email-options");
        });
    });
});