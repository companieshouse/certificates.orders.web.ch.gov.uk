import {Maybe, Session} from "ch-node-session-handler";
import {SessionKey} from "ch-node-session-handler/lib/session/keys/SessionKey";
import {SignInInfoKeys} from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import {ISignInInfo, IAccessToken} from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { ApplicationData, APPLICATION_DATA_KEY } from "../model/session.data";

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

export const getExtraData = (session: Maybe<Session>): Promise<any> => {
    return new Promise((resolve, reject) => {
    try {
        resolve(session
            .chain((_) => {
                console.log(_)
                return _.getExtraData();
            })
            .map<any>((data) => {
                console.log("THIS IS THE DATA")
                console.log(data);
                //return data[APPLICATION_DATA_KEY]
                return data;
            }).unsafeCoerce(),
        );
    } catch (err) {
        console.log(err);
        resolve({});
    }
    });
};

export const addExtraData = (session: Maybe<Session>, applicationData: ApplicationData): Promise<ApplicationData> => {
    // const sessionValue = session.unsafeCoerce();
    // return new Promise((resolve, reject) => {
    //     resolve(session.unsafeCoerce().getExtraData()
    //         .map<ApplicationData>((data) => data[APPLICATION_DATA_KEY])
    //         .orDefaultLazy(() => {
    //             const sess = session.unsafeCoerce().saveExtraData(APPLICATION_DATA_KEY, applicationData);
    //             console.log("this is extra data");
    //             console.log(sess.getExtraData());
    //             return applicationData;
    //         }));
    //     });
    const sess = session.unsafeCoerce().saveExtraData(APPLICATION_DATA_KEY, applicationData);

    return new Promise((resolve, reject) => {
        try {
          const s = this.getSessionStore();
          s.load(this.cookie).run()
            .then(data => {
              const session = new Session(data.extract());
              session.saveExtraData(this.id, value);
              s.store(this.cookie, session.data).run()
                .then(_ => {
                  return resolve(true);
                }).catch(err => {
                  return reject(err);
                });
            }).catch(err => {
              return reject(err);
            });
        } catch (err) {
          reject(err);
        }
      });
    }
};

export const clearExtraData = (session: Maybe<Session>) => {
    return addExtraData(session, {} as ApplicationData);
};
