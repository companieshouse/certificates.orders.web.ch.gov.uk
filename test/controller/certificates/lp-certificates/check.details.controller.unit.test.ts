import chai from "chai";

import {
    mapCertificateType,
    applyCurrencySymbol,
    isOptionSelected,
    mapPlaceOfBusinessAddress
} from "../../../../src/controllers/certificates/lp-certificates/check.details.controller";

describe("certificate.check.details.controller.unit", () => {
    describe("mapCertificateType", () => {
        it("removes the '-' if present and capitalises the first letter", () => {
            const testString1: string = "incorporation";
            const testString2: string = "incorporation-with-all-name-changes";
            const testString3: string = "incorporation-with-last-name-change";
            const testString4: string = "dissolution-liquidation";

            const mappedTestString1: string = mapCertificateType(testString1);
            const mappedTestString2: string = mapCertificateType(testString2);
            const mappedTestString3: string = mapCertificateType(testString3);
            const mappedTestString4: string = mapCertificateType(testString4);

            chai.expect(mappedTestString1).to.equal("Incorporation");
            chai.expect(mappedTestString2).to.equal("Incorporation with all company name changes");
            chai.expect(mappedTestString3).to.equal("Incorporation with last name change");
            chai.expect(mappedTestString4).to.equal("Dissolution liquidation");
        });
    });

    describe("applyCurrencySymbol", () => {
        it("it applies a '£' to the value passed in", () => {
            chai.expect(applyCurrencySymbol("15")).to.equal("£15");
        });
    });

    describe("returnsYesOrNo", () => {
        it("it returns yes or no if value has been declared on certificate options", () => {
            chai.expect(isOptionSelected(true)).to.equal("Yes");
            chai.expect(isOptionSelected(undefined)).to.equal("No");
        });
    });

    describe("mapRegisteredOfficeAddress", () => {
        it("maps the include_address_records_type field to display on text on page", () => {
            chai.expect(mapPlaceOfBusinessAddress("current")).to.equal("Current address");
            chai.expect(mapPlaceOfBusinessAddress("current-and-previous")).to.equal("Current address and the one previous");
            chai.expect(mapPlaceOfBusinessAddress("current-previous-and-prior")).to.equal("Current address and the two previous");
            chai.expect(mapPlaceOfBusinessAddress("all")).to.equal("All current and previous addresses");
            chai.expect(mapPlaceOfBusinessAddress(undefined)).to.equal("No");
        });
    });
});
