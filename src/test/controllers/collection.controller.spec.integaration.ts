import {createRedisMock, getSignedInCookie} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());
import app from "../../app";
import * as request from "supertest";
import {COLLECTION, replaceCompanyNumber} from "../../model/page.urls";

const COLLECTION_OPTION_NOT_SELECTED = "Select the Companies House office you want to collect your certificate from";

const COMPANY_NUMBER = "00000000";
const COLLECTION_URL = replaceCompanyNumber(COLLECTION, COMPANY_NUMBER);

describe("collection url test user signed in", () => {

  it("renders the collection web page", async () => {
    const resp = await request(app).get(COLLECTION_URL).set("Cookie", [getSignedInCookie()]); ;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Which Companies House office do you want to collect from?");
  });
});

describe("collection validation test user signed in", () => {

    it("should receive error message instructing user to select an option", async () => {
        const res = await request(app).post(COLLECTION_URL).set("Cookie", [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).toContain(COLLECTION_OPTION_NOT_SELECTED);
    });
});
