import { Request } from "express";
import { PageHeader } from "../model/PageHeader";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";

export const mapPageHeader = (req: Request): PageHeader => {

    const userEmailAddress = req.session?.data?.signin_info?.user_profile?.email;
    const isSignedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

    return {userEmailAddress: userEmailAddress ,isSignedIn: isSignedIn};
}