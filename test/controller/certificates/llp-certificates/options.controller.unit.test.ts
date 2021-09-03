import chai from "chai";
import sessionHandler from "@companieshouse/node-session-handler"; // need this to allow certificate.options.controller to compile

import { setItemOptions, hasOption } from "../../../../src/controllers/certificates/llp-certificates/options.controller";

describe("llp.certificate.options.controller.unit", () => {
    describe("setItemOptions", () => {
        it("should set includeGoodStandingInformation to true, when the option is goodStanding", () => {
            const options = ["goodStanding"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.true;
        });

        it("should set includeAddressRecordsType to current, when option is registeredOffice", () => {
            const options = ["registeredOffice"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.equal("current");
        });

        it("should set includeBasicInformation on DesignatedMemberDetails to true, when the option is designated members", () => {
            const options = ["designatedMembers"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.true;
        });

        it("should set includeBasicInformation on MemberDetails to true, when the option is members", () => {
            const options = ["members"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.true;
        });            

        it("should set multiple itemOptions, when multiple options are set", () => {
            const options = ["designatedMembers", "goodStanding", "companyObjects"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.true;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.true;
            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.null;
        });

        it("should leave multiple itemOptions to null, when there are no options", () => {
            const options = [];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.null;
        });

        it("should leave multiple itemOptions to null, when there options are undefined", () => {
            const returnedItemOptions = setItemOptions(undefined as unknown as string[]);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.null;
        });
    });

    describe("hasOption", () => {
        it("should return true if required option selected", () => {
            const options = ["option"];
            const expectedResult = hasOption(options, "option");

            chai.expect(expectedResult).to.equal(true);
        });

        it("should return false if directors option is not selected", () => {
            const options = ["notOption"];
            const expectedResult = hasOption(options, "option");

            chai.expect(expectedResult).to.equal(false);
        });
    });
});
