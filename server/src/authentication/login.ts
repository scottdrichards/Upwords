import { Pool } from 'mysql2/promise';
import { get as getUser, UserRow } from '../database/user/user';
import { HandlerError } from '../utils';
import { genHash, HashConfig, sign } from './authentication';

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
