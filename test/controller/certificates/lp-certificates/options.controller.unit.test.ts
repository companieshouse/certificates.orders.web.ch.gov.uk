import chai from "chai";
import sessionHandler from "@companieshouse/node-session-handler"; // need this to allow certificate.options.controller to compile

import { setItemOptions, hasOption } from "../../../../src/controllers/certificates/lp-certificates/options.controller";

describe("lp.certificate.options.controller.unit", () => {
    describe("setItemOptions", () => {
        it("should set includeGoodStandingInformation to true, when the option is goodStanding", () => {
            const options = ["goodStanding"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.true;
        });

        it("should set includeAddressRecordsType to current, when option is principal place of business", () => {
            const options = ["principalPlaceOfBusiness"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.principalPlaceOfBusinessDetails?.includeAddressRecordsType).to.equal("current");
        });

        it("should set includeBasicInformation on GeneralPartnerDetails to true, when the option is general partners", () => {
            const options = ["generalPartners"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.generalPartnerDetails?.includeBasicInformation).to.be.true;
        });

        it("should set includeBasicInformation on LimitedPartnerDetails to true, when the option is limited partners", () => {
            const options = ["limitedPartners"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.limitedPartnerDetails?.includeBasicInformation).to.be.true;
        });            

        it("should set multiple itemOptions, when multiple options are set", () => {
            const options = ["limitedPartners", "goodStanding", "principalPlaceOfBusiness"];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.true;
            chai.expect(returnedItemOptions?.principalPlaceOfBusinessDetails?.includeAddressRecordsType).to.equal("current");
            chai.expect(returnedItemOptions?.generalPartnerDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.limitedPartnerDetails?.includeBasicInformation).to.be.true;
        });

        it("should leave multiple itemOptions to null, when there are no options", () => {
            const options = [];
            const returnedItemOptions = setItemOptions(options);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.principalPlaceOfBusinessDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.generalPartnerDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.limitedPartnerDetails?.includeBasicInformation).to.be.null;
        });

        it("should leave multiple itemOptions to null, when there options are undefined", () => {
            const returnedItemOptions = setItemOptions(undefined as unknown as string[]);

            chai.expect(returnedItemOptions?.includeGoodStandingInformation).to.be.null;
            chai.expect(returnedItemOptions?.principalPlaceOfBusinessDetails?.includeAddressRecordsType).to.be.null;
            chai.expect(returnedItemOptions?.generalPartnerDetails?.includeBasicInformation).to.be.null;
            chai.expect(returnedItemOptions?.limitedPartnerDetails?.includeBasicInformation).to.be.null;
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
