import fs from "fs";
import yaml from "js-yaml";

const FILING_HISTORY_DESCRIPTIONS_PATH: string = "api-enumerations/filing_history_descriptions.yml";
const DESCRIPTIONS_CONSTANT: string = "description";

const filingHistoryDescriptions = yaml.load(fs.readFileSync(FILING_HISTORY_DESCRIPTIONS_PATH, "utf8"));

export const getFullFilingHistoryDescription = (descriptionKey: string): string => {
    if (filingHistoryDescriptions === undefined || filingHistoryDescriptions === null) {
        return descriptionKey;
    } else {
        return filingHistoryDescriptions[DESCRIPTIONS_CONSTANT][descriptionKey] || descriptionKey;
    }
};
