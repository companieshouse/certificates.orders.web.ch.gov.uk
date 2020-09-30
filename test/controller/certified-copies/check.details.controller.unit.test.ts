import { expect } from "chai";
import sinon from "sinon";

import { mapFilingHistoriesDocuments } from "../../../src/controllers/certified-copies/check.details.controller";
import * as apiEnumerations from "../../../src/config/api.enumerations";

const sandbox = sinon.createSandbox();

describe("certified-copies.check.details.controller.unit", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("mapFilingHistoriesDocuments", () => {
        it("should map filing history array correctly", () => {
            const filingHistoryDocuments = [{
                filingHistoryDate: "2010-02-12",
                filingHistoryDescription: "change-person-director-company-with-change-date",
                filingHistoryDescriptionValues: {
                    change_date: "2010-02-12",
                    officer_name: "Thomas David Wheare"
                },
                filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
                filingHistoryType: "CH01",
                filingHistoryCost: "15"
            }];
            sandbox.stub(apiEnumerations, "getFullFilingHistoryDescription")
                .returns("Appointment of {officer_name} as a director on {change_date}");
            const result = mapFilingHistoriesDocuments(filingHistoryDocuments);

            expect(result[0].filingHistoryDescription).to.equal("Appointment of Thomas David Wheare as a director on 12 February 2010");
            expect(result[0].filingHistoryDate).to.equal("12 Feb 2010");
            expect(result[0].filingHistoryId).to.equal("MzAwOTM2MDg5OWFkaXF6a2N4");
            expect(result[0].filingHistoryType).to.equal("CH01");
            expect(result[0].filingHistoryCost).to.equal("£15");
        });
    });
});
