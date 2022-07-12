import chai from "chai";
import { generateBackLink, optionFilter, setRegOfficeOption } from "../../../../src/controllers/certificates/llp-certificates/registered.office.options.controller";
import { RegisteredOfficeAddressOptionName } from "../../../../src/controllers/certificates/llp-certificates/RegisteredOfficeAddressOptionName";
import { AddressRecordsType } from "../../../../src/model/AddressRecordsType";

describe("registered.office.options.controller.unit", () => {
    describe("setRegOfficeOption", () => {
        it("should set office option to current", () => {
            const option = RegisteredOfficeAddressOptionName.CURRENT_ADDRESS;
            const returnedRegOfficeOption = setRegOfficeOption(option);

            chai.expect(returnedRegOfficeOption?.includeAddressRecordsType).to.equal(AddressRecordsType.CURRENT);
        });

        it("should set office option to current-and-previous", () => {
            const option = RegisteredOfficeAddressOptionName.CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS;
            const returnedRegOfficeOption = setRegOfficeOption(option);

            chai.expect(returnedRegOfficeOption?.includeAddressRecordsType).to.equal(AddressRecordsType.CURRENT_AND_PREVIOUS);
        });

        it("should set office option to current-previous-and-prior", () => {
            const option = RegisteredOfficeAddressOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS;
            const returnedRegOfficeOption = setRegOfficeOption(option);

            chai.expect(returnedRegOfficeOption?.includeAddressRecordsType).to.equal(AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR);
        });

        it("should set office option to all", () => {
            const option = RegisteredOfficeAddressOptionName.ALL_CURRENT_AND_PREVIOUS_ADDRESSES;
            const returnedRegOfficeOption = setRegOfficeOption(option);

            chai.expect(returnedRegOfficeOption?.includeAddressRecordsType).to.equal(AddressRecordsType.ALL);
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
