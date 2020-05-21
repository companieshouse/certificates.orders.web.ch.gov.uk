import { Maybe, Session } from "ch-node-session-handler";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { ISignInInfo, IAccessToken } from "ch-node-session-handler/lib/session/model/SessionInterfaces";

export const getAccessToken = (session: Maybe<Session>): string => {
    const signInInfo = session
        .map((_) => _.getValue<ISignInInfo>(SessionKey.SignInInfo))
        .unsafeCoerce();

    const accessToken = signInInfo
        .map((info) => info[SignInInfoKeys.AccessToken])
        .map((token: IAccessToken) => token.access_token as string)
        .unsafeCoerce();

    return accessToken;
};
