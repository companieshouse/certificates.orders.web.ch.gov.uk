import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";

export const getAccessToken = (session): string =>
    session?.data[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;

export const getUserId = (session): string =>
    session?.data[SessionKey.SignInInfo]?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

