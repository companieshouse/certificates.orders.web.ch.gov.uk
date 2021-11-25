import chai from "chai";
import sessionHandler from "@companieshouse/node-session-handler"; // need this to allow certificate.options.controller to compile

import { hasRegisterOfficeAddressOptions, setItemOptions, hasDirectorOption, optionFilter } from "../../../src/controllers/certificates/options.controller";

describe("certificate.options.controller.unit", () => {
    describe("setItemOptions", () => {
        it("should set includeBasicInformation on DirectorDetails to true, when the option is directors", () => {
            const options = ["directors"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.directorDetails?.includeBasicInformation).to.be.true;
        });

        it("should set includeCompanyObjectsInformation to true, when the option is companyObjects", () => {
            const options = ["companyObjects"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.includeCompanyObjectsInformation).to.be.true;
        });

        it("should set includeGoodStandingInformation to true, when the option is goodStanding", () => {
            const options = ["goodStanding"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.true;
        });

        it("should not overwrite includeAddressRecordsType, when option is registeredOffice", () => {
            const options = ["registeredOffice"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails).to.not.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.undefined;
        });

        it("should set includeBasicInformation on secretaryDetails to true, when the option is secretaries", () => {
            const options = ["secretaries"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.secretaryDetails?.includeBasicInformation).to.be.true;
        });

        it("should set includeBasicInformation on liquidatorsDetails to true, when the option is liquidators", () => {
            const options = ["liquidators"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.liquidatorsDetails?.includeBasicInformation).to.be.true;
        });

        it("should set multiple itemOptions, when multiple options are set", () => {
            const options = ["secretaries", "goodStanding", "companyObjects"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.secretaryDetails?.includeBasicInformation).to.be.true;
            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.true;
            chai.expect(returnedItemOptions?.includeCompanyObjectsInformation).to.be.true;
            chai.expect(returnedItemOptions?.directorDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
        });

        it("should leave multiple itemOptions to null, when there are no options", () => {
            const options = [];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.secretaryDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.includeCompanyObjectsInformation).to.be.null;
            chai.expect(returnedItemOptions?.directorDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
        });

        it("should leave multiple itemOptions to null, when there options are undefined", () => {
            const returnedItemOptions = setItemOptions(undefined as unknown as string[]);

            chai.expect(returnedItemOptions?.secretaryDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.includeCompanyObjectsInformation).to.be.null;
            chai.expect(returnedItemOptions?.directorDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.null;
        });
    });

    describe("hasRegisterOfficeAddressOptions", () => {
        it("should return true if registered office address option selected", () => {
            const options = ["registeredOffice"];
            const expectedResult = hasRegisterOfficeAddressOptions(options);

            chai.expect(expectedResult).to.equal(true);
        });

        it("should return false if registered office address option is not selected", () => {
            const options = ["goodStanding"];
            const expectedResult = hasRegisterOfficeAddressOptions(options);

            chai.expect(expectedResult).to.equal(false);
        });
    });

    describe("hasDirectorOption", () => {
        it("should return true if directors option selected", () => {
            const options = ["directors"];
            const expectedResult = hasDirectorOption(options);

            chai.expect(expectedResult).to.equal(true);
        });

        it("should return false if directors option is not selected", () => {
            const options = ["goodStanding"];
            const expectedResult = hasDirectorOption(options);

            chai.expect(expectedResult).to.equal(false);
        });
    });

    describe("optionFilter", () => {
        it("should preserve an option if no filter defined", () => {
            const options = [{value: "goodStanding"}];
            const filter = {};
            chai.expect(optionFilter(options, filter)).to.eql([{value: "goodStanding"}]);
        });

        it("should remove an option if filter evaluates to false", () => {
            const options = [{value: "goodStanding"}, {value: "liquidators"}];
            const filter = {goodStanding: false};
            chai.expect(optionFilter(options, filter)).to.eql([{value: "liquidators"}]);
        });

        it("should preserve an option if filter evaluates to true", () => {
            const options = [{value: "goodStanding"}, {value: "liquidators"}];
            const filter = {goodStanding: true};
            chai.expect(optionFilter(options, filter)).to.eql([{value: "goodStanding"}, {value: "liquidators"}]);
        });
    });
});
