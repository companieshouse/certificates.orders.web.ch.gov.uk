import chai from "chai";
import sessionHandler from "@companieshouse/node-session-handler"; // need this to allow certificate.options.controller to compile

import { setItemOptions, hasOption } from "../../../../src/controllers/certificates/llp-certificates/options.controller";

describe("llp.certificate.options.controller.unit", () => {
    describe("setItemOptions", () => {
        it("should set includeGoodStandingInformation to true, when the option is goodStanding", () => {
            const options = ["goodStanding"];
            const returnedItemOptions = setItemOptions("active", options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.true;
            chai.expect(returnedItemOptions).to.not.have.property("liquidatorsDetails");
        });

        it("should not overwrite includeAddressRecordsType, when option is registeredOffice", () => {
            const options = ["registeredOffice"];
            const returnedItemOptions = setItemOptions("active", options);

            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails).to.not.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.undefined;
            chai.expect(returnedItemOptions).to.not.have.property("liquidatorsDetails");
        });

        it("should set includeBasicInformation on DesignatedMemberDetails to true, when the option is designated members", () => {
            const options = ["designatedMembers"];
            const returnedItemOptions = setItemOptions("active", options);

            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.true;
            chai.expect(returnedItemOptions).to.not.have.property("liquidatorsDetails");
        });

        it("should set includeBasicInformation on MemberDetails to true, when the option is members", () => {
            const options = ["members"];
            const returnedItemOptions = setItemOptions("active", options);

            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.true;
            chai.expect(returnedItemOptions).to.not.have.property("liquidatorsDetails");
        });

        it("should set includeBasicInformation on liquidatorsDetails to true, when the option is liquidators and company is in liquidation", () => {
            const options = ["liquidators"];
            const returnedItemOptions = setItemOptions("liquidation", options);

            chai.expect(returnedItemOptions?.liquidatorsDetails?.includeBasicInformation).to.be.true;
        });

        it("should not set liquidatorsDetails, when the option is liquidators and company is not in liquidation", () => {
            const options = ["liquidators"];
            const returnedItemOptions = setItemOptions("active", options);

            chai.expect(returnedItemOptions).to.not.have.property("liquidatorsDetails");
        });

        it("should set multiple itemOptions, when multiple options are set", () => {
            const options = ["designatedMembers", "goodStanding", "companyObjects"];
            const returnedItemOptions = setItemOptions("active", options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.true;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.true;
            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions).to.not.have.property("liquidatorsDetails");
        });

        it("should leave multiple itemOptions to null, when there are no options", () => {
            const options = [];
            const returnedItemOptions = setItemOptions("active", options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions).to.not.have.property("liquidatorsDetails");
        });

        it("should leave multiple itemOptions to null, when there options are undefined", () => {
            const returnedItemOptions = setItemOptions("active");

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions).to.not.have.property("liquidatorsDetails");
        });

        it("should set liquidatorsDetails to null if company is in liquidation and options undefined", () => {
            const returnedItemOptions = setItemOptions("liquidation");

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.designatedMemberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.memberDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.liquidatorsDetails?.includeBasicInformation).to.be.null;
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
