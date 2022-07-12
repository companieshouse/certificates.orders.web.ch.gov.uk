import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";

export const dataEmpty = new Session({});
export const fullPageFalse = new Session({ extra_data: { "certificates-orders-web-ch-gov-uk": { isFullPage: false } } });
export const fullPageTrue = new Session({ extra_data: { "certificates-orders-web-ch-gov-uk": { isFullPage: true } } });
