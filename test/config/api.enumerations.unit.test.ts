import { expect } from "chai";

import { getFullFilingHistoryDescription } from "../../src/config/api.enumerations";

describe("api.enumerations.unit", () => {
    describe("getFullFilingHistoryDescription", () => {
        it("should load the filing history file from api-enumeration correctly and load data from it", () => {
            const result = getFullFilingHistoryDescription("change-person-director-company-with-change-date");
            expect(result).to.equal("**Director's details changed** for {officer_name} on {change_date}");
        });

        it("should return the same input passed in if filing history description is not present", () => {
            const result = getFullFilingHistoryDescription("test-123");
            expect(result).to.equal("test-123");
        });
    });
});
