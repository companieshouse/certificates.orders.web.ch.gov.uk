import chai from "chai";
import { generateBackLink, optionFilter, setPrincipalPlaceOption } from "../../../../src/controllers/certificates/lp-certificates/principal.place.options.controller";
import { PrincipalPlaceOfBusinessOptionName } from "../../../../src/controllers/certificates/lp-certificates/PrincipalPlaceOfBusinessOptionName";
import { AddressRecordsType } from "../../../../src/model/AddressRecordsType";

describe("principal.place.options.controller.unit", () => {
    describe("setPrincipalPlaceOption", () => {
        it("should set principal place option to current", () => {
            const option = PrincipalPlaceOfBusinessOptionName.CURRENT_ADDRESS;
            const returnedPrincipalPlaceOption = setPrincipalPlaceOption(option);

            chai.expect(returnedPrincipalPlaceOption?.includeAddressRecordsType).to.equal(AddressRecordsType.CURRENT);
        });

        it("should set office option to current-and-previous", () => {
            const option = PrincipalPlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS;
            const returnedPrincipalPlaceOption = setPrincipalPlaceOption(option);

            chai.expect(returnedPrincipalPlaceOption?.includeAddressRecordsType).to.equal(AddressRecordsType.CURRENT_AND_PREVIOUS);
        });

        it("should set office option to current-previous-and-prior", () => {
            const option = PrincipalPlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS;
            const returnedPrincipalPlaceOption = setPrincipalPlaceOption(option);

            chai.expect(returnedPrincipalPlaceOption?.includeAddressRecordsType).to.equal(AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR);
        });

        it("should set office option to all", () => {
            const option = PrincipalPlaceOfBusinessOptionName.ALL_CURRENT_AND_PREVIOUS_ADDRESSES;
            const returnedPrincipalPlaceOption = setPrincipalPlaceOption(option);

            chai.expect(returnedPrincipalPlaceOption?.includeAddressRecordsType).to.equal(AddressRecordsType.ALL);
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

        it("should link to principal place options page if full page requested", () => {
            chai.expect(generateBackLink(true)).to.equal("principal-place-of-business-options");
        });
    });
});
