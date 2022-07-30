import crypto from 'crypto';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'mysql2/promise';
import { get as getUser, UserRow } from '../database/user/user';
import { HandlerError } from '../utils';
import { genHash, HashConfig, sign } from './authentication';


export const sign = (data:string | object | Buffer) => {
  if (typeof process.env.ACCESS_TOKEN_SECRET !== 'string') throw new Error('ACCESS_TOKEN_SECRET not set');

  const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);
  return { accessToken };
};

export const authenticateToken:RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === undefined) {
    res.sendStatus(401);
    return;
  }

  if (typeof process.env.ACCESS_TOKEN_SECRET !== 'string') throw new Error('ACCESS_TOKEN_SECRET not set');

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userID) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    res.locals.userID = userID;
    next();
  });
};

export type HashConfig = {
    hashLength:number,
    iterations:number,
    digest:string,
}

export const genHash = (password:crypto.BinaryLike, salt: crypto.BinaryLike, config:HashConfig)=>{
    const { iterations, hashLength, digest} = config;
    return crypto.pbkdf2Sync(password, salt, iterations, hashLength, digest).toString('hex');
}


export default async (pool:Pool, userID:string, password:string, config:HashConfig) => {
  const rowData = await getUser(userID, pool, true);
  const { salt, hash: trueHash } = rowData as UserRow;

  const hashSupplied = genHash(password, salt, config)

  const validated = trueHash === hashSupplied;
  if (!validated) {
    throw new HandlerError('Invalid Username or Password');
  }
  return sign(userID);
};