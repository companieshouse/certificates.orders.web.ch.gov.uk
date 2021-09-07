import chai from "chai";
import { generateBackLink, optionFilter, setPrinciplePlaceOption } from "../../../../src/controllers/certificates/lp-certificates/principle.place.options.controller";
import { PrinciplePlaceOfBusinessOptionName } from "../../../../src/controllers/certificates/lp-certificates/PrinciplePlaceOfBusinessOptionName";

describe("principle.place.options.controller.unit", () => {
    describe("setPrinciplePlaceOption", () => {
        it("should set principle place option to current", () => {
            const option = PrinciplePlaceOfBusinessOptionName.CURRENT_ADDRESS;
            const returnedPrinciplePlaceOption = setPrinciplePlaceOption(option);

            chai.expect(returnedPrinciplePlaceOption?.includeAddressRecordsType).to.equal("current");
        });

        it("should set office option to current-and-previous", () => {
            const option = PrinciplePlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS;
            const returnedPrinciplePlaceOption = setPrinciplePlaceOption(option);

            chai.expect(returnedPrinciplePlaceOption?.includeAddressRecordsType).to.equal("current-and-previous");
        });

        it("should set office option to current-previous-and-prior", () => {
            const option = PrinciplePlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS;
            const returnedPrinciplePlaceOption = setPrinciplePlaceOption(option);

            chai.expect(returnedPrinciplePlaceOption?.includeAddressRecordsType).to.equal("current-previous-and-prior");
        });

        it("should set office option to all", () => {
            const option = PrinciplePlaceOfBusinessOptionName.ALL_CURRENT_AND_PREVIOUS_ADDRESSES;
            const returnedPrinciplePlaceOption = setPrinciplePlaceOption(option);

            chai.expect(returnedPrinciplePlaceOption?.includeAddressRecordsType).to.equal("all");
        });
    });

    describe("optionFilter", () => {
        it("should filter an object from an array if the display field is false", () => {
            const options = [{display: false}, {display: true}]
            chai.expect(optionFilter(options)).to.have.lengthOf(1)
        })
    });

    describe("generateBackLink", () => {
        it("should link to certificate options page if abbreviated page requested", () => {
            chai.expect(generateBackLink(false)).to.equal("certificate-options")
        })

        it("should link to principle place options page if full page requested", () => {
            chai.expect(generateBackLink(true)).to.equal("principle-place-of-business-options")
        })
    })
});
