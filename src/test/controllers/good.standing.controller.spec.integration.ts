import {createRedisMock, getSignedInCookie} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());

import app from "../../app";
import * as request from "supertest";
import {GOOD_STANDING, replaceCompanyNumber} from "../../model/page.urls";

const GOOD_STANDING_OPTION_NOT_SELECTED = "Select if you want good standing information on the certificate";

const COMPANY_NUMBER = "00000000";
const GOOD_STANDING_URL = replaceCompanyNumber(GOOD_STANDING, COMPANY_NUMBER);

describe("good standing url test", () => {

  it("renders the good standing web page", async () => {
    const resp = await request(app).get(GOOD_STANDING_URL).set("Cookie", [getSignedInCookie()]);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Do you want good standing information");
  });
});

describe("good standing validation test", () => {

    it("should receive error message instructing user to select an option", async () => {
        const res = await request(app).post(GOOD_STANDING_URL).set("Cookie", [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).toContain(GOOD_STANDING_OPTION_NOT_SELECTED);
    });
});
