import { Encoding } from "ch-node-session-handler/lib/encoding/Encoding";
const SIGNED_IN_ID = "4ZhJ6pAmB5NAJbjy/6fU1DWMqqrk";
const SIGNED_IN_SIGNATURE = "Ak4CCqkfPTY7VN6f9Lo5jHCUYpM";
const SIGNED_IN_COOKIE = SIGNED_IN_ID + SIGNED_IN_SIGNATURE;
const SIGNED_OUT_ID = "2VsqkD1ILMqzO0NyuL+ubx4crUCP";
const SIGNED_OUT_SIGNATURE = "9L9X4DGu5LOaE2yaGjPk+vGZcMw";
const SIGNED_OUT_COOKIE = SIGNED_OUT_ID + SIGNED_OUT_SIGNATURE;

const signedInSession = {
  ".client.signature": SIGNED_IN_SIGNATURE,
  ".id": SIGNED_IN_ID,
  "expires": Date.now() + 3600 * 1000,
  "signin_info": {
    access_token: {
      access_token: "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw",
      expires_in: 3600,
      refresh_token: "y4YXof84bkUeBZlavRlAGfdq5VMkpPm6UR0OYwPvI6i6UDmtEiTQ1Ro-HGCGo01y4ploP4Kdwd6H4dEh8-E_Fg",
      token_type: "Bearer",
    },
    signed_in: 1,
  },
  "extra_data": {
    "certificates.orders.web.ch.gov.uk": {
      certificate: {
        id: "CHS00000000000000001",
        companyNumber: "00000000"
      }
    }
  }
};
const signedOutSession = {
  ".client.signature": SIGNED_OUT_SIGNATURE,
  ".id": SIGNED_OUT_ID,
  "expires": Date.now() + 3600 * 1000,
  "signin_info": {
    access_token: {
      access_token: "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw",
      expires_in: 3600,
      refresh_token:
        "y4YXof84bkUeBZlavRlAGfdq5VMkpPm6UR0OYwPvI6i6UDmtEiTQ1Ro-HGCGo01y4ploP4Kdwd6H4dEh8-E_Fg",
      token_type:
        "Bearer",
    },
    signed_in: 0,
  },
};

const signedInSessionNoExtraData = {
  ".id": "Q0alkZmcO+AqPLpC/Nm29VTSjbJy",
  ".client.signature": "/qh+oX5bffvASs+AAUYbfbhm+QU",
  "expires": Date.now() + 3600 * 1000,
  "signin_info": {
    "access_token": {
      "access_token": "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw",
      "expires_in": 3600,
      "refresh_token": "y4YXof84bkUeBZlavRlAGfdq5VMkpPm6UR0OYwPvI6i6UDmtEiTQ1Ro-HGCGo01y4ploP4Kdwd6H4dEh8-E_Fg",
      "token_type": "Bearer"
    },
    "signed_in": 1
  }
}
export const getCookieHeader = (cookieId: string): string => {
  return `__SID=${cookieId}`;
};
export const getSignedInCookie = (): string => {
  return getCookieHeader(SIGNED_IN_COOKIE);
};
export const getSignedOutCookie = (): string => {
  return getCookieHeader(SIGNED_OUT_COOKIE);
};
export const getSignedInCookieNoExtraData = (): string => {
  return getCookieHeader(signedInSessionNoExtraData[".id"] + signedInSessionNoExtraData[".client.signature"]);
};

export const createRedisMock = () => {
  const ioredisMock = require("ioredis-mock");
  if (typeof ioredisMock === "object") {
    // the first mock is an ioredis shim because ioredis-mock depends on it
    // https://github.com/stipsan/ioredis-mock/blob/master/src/index.js#L101-L111
    // see this issue https://github.com/stipsan/ioredis-mock/issues/568
    return {
      Command: { _transformer: { argument: {}, reply: {} } },
    };
  }
  // second mock for our code
  // tslint:disable-next-line:only-arrow-functions
  return function () {
    const redisMock = new ioredisMock();
    redisMock.set(SIGNED_IN_ID, Encoding.encode(signedInSession));
    redisMock.set(SIGNED_OUT_ID, Encoding.encode(signedOutSession));
    redisMock.set(signedInSessionNoExtraData[".id"], Encoding.encode(signedInSessionNoExtraData));
    return redisMock;
  };
};
