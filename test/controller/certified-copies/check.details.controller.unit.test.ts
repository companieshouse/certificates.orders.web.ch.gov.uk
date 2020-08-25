import { expect } from "chai";
import sinon, { restore } from "sinon";

import {
    mapFilingHistoryDescriptionValues, removeAsterisks, mapDate, mapDateFullMonth,
    mapFilingHistoriesDocuments
} from "../../../src/controllers/certified-copies/check.details.controller";
import * as apiEnumerations from "../../../src/config/api.enumerations";

describe("certified-copies.check.details.controller.unit", () => {
    describe("mapFilingHistoryDescriptionValues", () => {
        it("should return the description in the descriptionValues if it is present", () => {
            const description = "legacy";
            const descriptionValues = {
                description: "this is the description"
            };
            const result = mapFilingHistoryDescriptionValues(description, descriptionValues);
            expect(result).to.equal(descriptionValues.description);
        });

        it("should replace the values in the description with the values in the descriptionValues", () => {
            const description = "Appointment of {officer_name} as a director on {change_date}";
            const descriptionValues = {
                change_date: "2010-02-12",
                officer_name: "Thomas David Wheare"
            };
            const result = mapFilingHistoryDescriptionValues(description, descriptionValues);
            expect(result).to.equal("Appointment of Thomas David Wheare as a director on 12 February 2010");
        });
    });

    describe("removeAsterisks", () => {
        it("should remove asterisks in text", () => {
            const text = "**Appointment** of ";
            const result = removeAsterisks(text);
            expect(result).to.equal("Appointment of ");
        });
    });

    describe("mapDate", () => {
        it("should map date from 2010-02-12 to 12 Feb 2010", () => {
            const date = "2010-02-12";
            const result = mapDate(date);
            expect(result).to.equal("12 Feb 2010");
        });
    });

    describe("mapDateFullMonth", () => {
        it("should map date from 2010-02-12 to 12 February 2010", () => {
            const date = "2010-02-12";
            const result = mapDateFullMonth(date);
            expect(result).to.equal("12 February 2010");
        });
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
            sinon.stub(apiEnumerations, "getFullFilingHistoryDescription")
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
