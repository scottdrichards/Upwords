/* eslint-disable import/prefer-default-export */
import { RequestHandler, Request } from 'express';

export class HandlerError extends Error {
  userError:boolean

  constructor(message:string, userError:boolean = true) {
    super(message);
    this.userError = userError;
    const actualProto = new.target.prototype;
    Object.setPrototypeOf(this, actualProto);
  }
}

// eslint-disable-next-line no-unused-vars
export const handlerWrapper = (requestHandler:(r:Request)=>any)
:RequestHandler => async (req, res) => {
  try {
    const result = await requestHandler(req);
    res.status(200).send(result);
  } catch (e) {
    if (!(e instanceof HandlerError)) throw (e);

    if (e.userError) {
      res.status(400).send(e.message);
    } else {
      res.status(500).send();
      throw (e);
    }
  }
};
