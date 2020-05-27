import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";

export const getAccessToken = (session): string => {
    const signInInfo = session?.data[SessionKey.SignInInfo];

    const accessToken = signInInfo?.[SignInInfoKeys.AccessToken]?.[SignInInfoKeys.AccessToken]!;

    return accessToken;
};

export const getUserId = (session): string => {
    const signInInfo = session?.data[SessionKey.SignInInfo];

    const userId = signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.UserId];

    return userId;
};
