import { Encoding } from "ch-node-session-handler/lib/encoding/Encoding";

const SIGNED_IN_ID = "4ZhJ6pAmB5NAJbjy/6fU1DWMqqrk";
const SIGNED_IN_SIGNATURE = "Ak4CCqkfPTY7VN6f9Lo5jHCUYpM";
export const SIGNED_IN_COOKIE = SIGNED_IN_ID + SIGNED_IN_SIGNATURE;

export const signedInSession = Encoding.encode({
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
});

const SIGNED_OUT_ID = "2VsqkD1ILMqzO0NyuL+ubx4crUCP";
const SIGNED_OUT_SIGNATURE = "9L9X4DGu5LOaE2yaGjPk+vGZcMw";
export const SIGNED_OUT_COOKIE = SIGNED_OUT_ID + SIGNED_OUT_SIGNATURE;

export const signedOutSession = Encoding.encode({
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
});
