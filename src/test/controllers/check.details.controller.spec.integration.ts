import {createRedisMock, getSignedInCookie} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());
jest.mock("../../client/api.client");

import app from "../../app";
import * as request from "supertest";
import {CHECK_DETAILS, replaceCompanyNumber} from "../../model/page.urls";
import { addItemToBasket } from "../../client/api.client";
import { ItemUri } from "ch-sdk-node/dist/services/order/basket/types";

const COMPANY_NUMBER = "00000000";
const ITEM_URI = "/orderable/certificates/CHS00000000000000052"
const CHECK_DETAILS_URL= replaceCompanyNumber(CHECK_DETAILS, COMPANY_NUMBER);

const mockAddItemToBasket: jest.Mock = (<unknown> addItemToBasket as jest.Mock<typeof addItemToBasket>);

describe("check details", () => {
    it("renders the check details screen", async () => {
      // dispatch a request to the homepage using supertest
      const resp = await request(app)
        .get(replaceCompanyNumber(CHECK_DETAILS, COMPANY_NUMBER))
        .set("Cookie", [getSignedInCookie()]);

      // make some assertions on the response
      expect(resp.status).toEqual(200);
    });
  });

describe("check details post", () => {
  it("redirects the user to orders url", async () => {
    const itemUri = { itemUri: ITEM_URI} as ItemUri;

    mockAddItemToBasket.mockImplementation(() => Promise.resolve(itemUri));

    const resp = await request(app)
      .post(CHECK_DETAILS_URL)
      .set("Cookie", [getSignedInCookie()]);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain("/basket")
  });
});

