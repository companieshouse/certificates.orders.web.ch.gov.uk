import {createRedisMock, getSignedInCookie} from "../utils/mock.redis"
jest.mock('ioredis', () => createRedisMock());

import app from "../../app";
import * as request from "supertest";
import {CERTIFICATE_OPTIONS} from "../../model/page.urls"

jest.mock("../../client/api.client");

describe("certificate options url test", () => {
  it("renders the certificate options page", async () => {
    const resp = await request(app)
        .get(CERTIFICATE_OPTIONS)
        .set('Cookie', [getSignedInCookie()]);;
    
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("What information would you like to be included on the certificate?");
  });
});
