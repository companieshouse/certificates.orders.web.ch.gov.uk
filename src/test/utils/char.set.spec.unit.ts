import {validateCharSet} from "../../utils/char-set";

const DUMMY_INVALID_NAME = "aaaa|";
const DUMMY_VALID_NAME = "bbbbbbbb";

describe("char set utils test", () => {

    it("should return true if an invalid character is found", () => {
        const validatedCharSet = validateCharSet(DUMMY_INVALID_NAME);
        expect(validatedCharSet).toBeTruthy;
    });

    it("should return false if no invalid characters are found", () => {
        const validatedCharSet = validateCharSet(DUMMY_VALID_NAME);
        expect(validatedCharSet).toBeFalsy;
    });
});
