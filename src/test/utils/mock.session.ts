export const validSessionMiddleware = jest.fn(function sessionRequestHandler(config, sessionStore): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction): Promise<any> => {
      request.session = Just(new Session(
        {
          '.id': 1231,
          '.client.signature': 12312321,
          '.hijacked': null,
          '.oauth2_nonce': 'LBvC2UC8EJ4FbpNfUlrOchBgXk//9WZYezudvWpd5txyx3ziELR7AcajZvam2XoMNBTGTgIddrdMs1ccE9seUw==',
          '.zxs_key': 'CxKb2u0GILQPQalUuIYy1ZjL3QquDuYgnedwIafZC7V3mqJ0wH988/VZUMZMvlCs7rYLVHRvEagnYT8TBb9E3w==',
          expires: Date.now() + 3600 * 1000,
          last_access: Date.now(),
          pst: 'all',
          signin_info: {
            access_token: {
              access_token: '/T+R3ABq5SPPbZWSeePnrDE1122FEZSAGRuhmn21aZSqm5UQt/wqixlSViQPOrWe2iFb8PeYjZzmNehMA3JCJg==',
              expires_in: 3600,
              refresh_token: 'xUHinh19D17SQV2BYRLnGEZgeovYhcVitzLJMxpGxXW0w+30EYBb+6yF44pDWPsPejI17R5JSwy/Cw5kYQKO2A==',
              token_type: 'Bearer'
            },
            admin_permissions: '0',
            signed_in: 1,
            user_profile: {
              email: 'test',
              forename: 'tester',
              id: 'sA==',
              locale: 'GB_en',
              scope: null,
              surname: 'test'
            }
          }
        }
      ))
      return next();
    }
  });
  import { Just } from 'purify-ts'
  import { Request, Response, NextFunction, RequestHandler } from "express";
  import { Session } from 'ch-node-session-handler/lib/session/model/Session';