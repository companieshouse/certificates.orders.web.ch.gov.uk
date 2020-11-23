import chai from "chai";
import sessionHandler from "@companieshouse/node-session-handler"; // need this to allow certificate.options.controller to compile

import { setItemOptions } from "../../../src/controllers/certificates/options.controller";

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

        it("should set includeAddressRecordsType to current, when option is registeredOffice", () => {
            const options = ["registeredOffice"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).to.equal("current");
        });

        it("should set includeBasicInformation on secretaryDetails to true, when the option is secretaries", () => {
            const options = ["secretaries"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.secretaryDetails?.includeBasicInformation).to.be.true;
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
});
