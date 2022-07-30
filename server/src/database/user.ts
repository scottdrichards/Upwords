/* eslint-disable indent */
import crypto from 'crypto';
import { Pool, RowDataPacket } from 'mysql2/promise';
import { HandlerError } from '../utils';
import { initParams } from './database';

const USERS_TABLE_NAME = 'users';

export const MYSQL_USER_ID = (length:number) => ({ username: { type: `CHAR(${length})` } });

export const USER_ROW_FIELDS = ({ usernameMaxLength, passHashLen }:
Pick<initParams, 'usernameMaxLength'| 'passHashLen'>) => ({
  username: { type: `VARCHAR(${usernameMaxLength})`, modifiers: ['PRIMARY KEY'] },
  salt: { type: `CHAR(${passHashLen * 2})` },
  hash: { type: `CHAR(${passHashLen * 2})` },
});



export default async ({username,password}:{username:string,password:string}, pool:Pool,authConfig:AuthenticationConfig)=>{

}


type keys = keyof ReturnType<typeof USER_ROW_FIELDS>
type ParamsQuery = Record<keys, string>

export interface AuthenticationConfig{
  hashLength:number,
  saltLength:number,
  iterations:number,
  digest:string
}

interface ParamsIn{
  username:string,
  password:string,
}
export const newUser = async ( paramsIn:ParamsIn, pool:Pool,authConfig:AuthenticationConfig,) => {
  const { password, username } = paramsIn;
  const { hashLength, saltLength, iterations, digest} = authConfig;
  Object.entries({ username, password }).forEach(([k, v]) => {
    if (v === undefined) throw new HandlerError(`${k} not provided`, true);
    if (typeof v !== 'string') throw new HandlerError(`${k} must be provided as a string`, true);
  });
  if (password.length <= 3) throw new HandlerError('Password must be greater than 3 characters', true);

  const salt = crypto.randomBytes(saltLength).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, iterations, hashLength, digest).toString('hex');

  const params:ParamsQuery = {
    username,
    salt,
    hash,
  };

  Object.entries(params).forEach(([k, v]) => {
    if (typeof v !== 'string') throw new HandlerError(`${k} must be provided as a string`, true);
  });

  if (username.length === 0) throw new HandlerError(`UserID must be at least one character`);

  const sql = `INSERT INTO ${
    USERS_TABLE_NAME}(${Object.keys(params).join(',')}) VALUES(${
    Object.values(params).map((val) => `'${val}'`).join(',')})`;

  try {
    await pool.query(sql);
  } catch (e) {
    const err = e as any;
    if ((err as any)?.code === 'ER_DUP_ENTRY') {
      throw new HandlerError(`User ${userID} already in database`, true);
    }

    throw new HandlerError(err.message);
  }
};

export const loginOrCreate = async ( paramsIn:ParamsIn, pool:Pool,authConfig:AuthenticationConfig,) => {

}


// eslint-disable-next-line camelcase
// export type UserRow ={username:string, email:string, salt:string, hash:string};
interface UserRowBasic extends RowDataPacket{
  // eslint-disable-next-line camelcase
  username:string,
  email:string,
}
export interface UserRow extends UserRowBasic{
  salt:string,
  hash:string
}
export const get = async (userID:string,
  pool:Pool,
  authInfo = false) => {
  const fields = authInfo ? '*' : 'username, email';
  const queryString = `SELECT ${fields} FROM \`${USERS_TABLE_NAME}\` WHERE \`username\` = "${userID}"`;
  const response = await pool.query<(UserRow|UserRowBasic)[]>(queryString);
  const [[row]] = response;
  if (row === undefined) throw new Error('Did not find user');

  if (!authInfo) {
    // eslint-disable-next-line camelcase
    const { username, email } = row;
    return { username, email };
  }
  return row;
};

export interface FoundRow extends UserRowBasic{
  found:number
}
export const userExists = async(userID:string, pool:Pool)=>{
  const queryString = `SELECT EXISTS(SELECT * FROM \`${USERS_TABLE_NAME}\` WHERE \`username\` = "${userID}") AS 'found'`;
  const response = await pool.query<FoundRow[]>(queryString);
  const found = response[0][0].found===1;
  return found;
}
