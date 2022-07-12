import chai from "chai";
import { generateBackLink, optionFilter, setRegOfficeOption } from "../../../src/controllers/certificates/registered.office.options.controller";

describe("registered.office.options.controller.unit", () => {
    describe("setRegOfficeOption", () => {
        it("should set office option to current", () => {
            const option = "currentAddress";
            const returnedRegOfficeOption = setRegOfficeOption(option);

            chai.expect(returnedRegOfficeOption?.includeAddressRecordsType).to.equal("current");
        });

        it("should set office option to current-and-previous", () => {
            const option = "currentAddressAndTheOnePrevious";
            const returnedRegOfficeOption = setRegOfficeOption(option);

            chai.expect(returnedRegOfficeOption?.includeAddressRecordsType).to.equal("current-and-previous");
        });

        it("should set office option to current-previous-and-prior", () => {
            const option = "currentAddressAndTheTwoPrevious";
            const returnedRegOfficeOption = setRegOfficeOption(option);

            chai.expect(returnedRegOfficeOption?.includeAddressRecordsType).to.equal("current-previous-and-prior");
        });

        it("should set office option to all", () => {
            const option = "allCurrentAndPreviousAddresses";
            const returnedRegOfficeOption = setRegOfficeOption(option);

            chai.expect(returnedRegOfficeOption?.includeAddressRecordsType).to.equal("all");
        });
    });

    describe("optionFilter", () => {
        it("should filter an object from an array if the display field is false", () => {
            const options = [{ display: false }, { display: true }];
            chai.expect(optionFilter(options)).to.have.lengthOf(1);
        });
    });

    describe("generateBackLink", () => {
        it("should link to certificate options page if abbreviated page requested", () => {
            chai.expect(generateBackLink(false)).to.equal("certificate-options");
        });

        it("should link to registered office options page if full page requested", () => {
            chai.expect(generateBackLink(true)).to.equal("registered-office-options");
        });
    });
});
