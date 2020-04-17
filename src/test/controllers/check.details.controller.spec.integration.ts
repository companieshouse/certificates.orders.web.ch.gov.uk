import {createRedisMock, getSignedInCookie} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());

import app from "../../app";
import * as request from "supertest";
import {CHECK_DETAILS} from "../../model/page.urls";

describe("check details", () => {
    it("renders the check details screem", async () => {
      // dispatch a request to the homepage using supertest
      const resp = await (await request(app).get(CHECK_DETAILS).set("Cookie", [getSignedInCookie()]));

      // make some assertions on the response
      expect(resp.status).toEqual(200);
    });
  });
