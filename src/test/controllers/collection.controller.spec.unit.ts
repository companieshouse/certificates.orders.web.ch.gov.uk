import {createRedisMock, getSignedInCookie, getSignedOutCookie} from "../utils/mock.redis"
jest.mock('ioredis', () => createRedisMock());
import app from "../../app";
import * as request from "supertest";  
import {COLLECTION} from "../../model/page.urls"

const COLLECTION_OPTION_NOT_SELECTED = "Select the Companies House office you want to collect your certificate from"

describe("collection url test", () => {

  it("renders the collection web page", async () => {
    const resp = await request(app).get(COLLECTION).set('Cookie', [getSignedInCookie()]);;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Which Companies House office do you want to collect from?");
  });
});

describe("collection validation test", () => {

    it("should receive error message instructing user to select an option", async () => {
        const res = await request(app).post(COLLECTION).set('Cookie', [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).toContain(COLLECTION_OPTION_NOT_SELECTED)
    })
});