jest.mock("ioredis");

import app from "../../app";
import * as request from "supertest";
import {ROOT, replaceCompanyNumber} from "../../model/page.urls";

const COMPANY_NUMBER = "00000000";

describe("home handler", () => {
  it("renders the start page", async () => {
    // dispatch a request to the homepage using supertest
    const resp = await request(app).get(replaceCompanyNumber(ROOT, COMPANY_NUMBER));

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Order a certificate");
  });
});
