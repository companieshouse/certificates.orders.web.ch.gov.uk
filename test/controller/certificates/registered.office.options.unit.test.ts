import chai from "chai";
import { setRegOfficeOption } from "../../../src/controllers/certificates/registered.office.options.controller";

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
});
