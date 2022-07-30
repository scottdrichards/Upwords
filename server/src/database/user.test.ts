import { Pool } from 'mysql2/promise';
import config from '../config';
import * as Database from './database';
import { get, newUser, userExists, UserRow } from './user';

describe('User', () => {
  const authInfo = {
    hashLength: config.database.passHashLen,
    saltLength: config.database.passSaltLen,
    iterations: config.database.iterations,
    digest: config.database.digest,
  };

  let pool:Pool;
  beforeAll(async () => {
    pool = await Database.initialize(config.database as Database.initParams);
  });

  const userID = 'Bob';
  const password = 'security';
  const email = 'email@domain.com';
  describe('Create', () => {
    test('Valid input', async () => {
      await expect(newUser({ username: userID, password, email }, pool, authInfo))
        .resolves.not.toThrow();
    });
    test('Already Exists', async () => {
      await expect(newUser({ username: userID, password, email }, pool, authInfo))
        .rejects.toThrow();
    });
    test('Username too long', async () => {
      await expect(newUser({ username: '#'.repeat(config.database.usernameMaxLength + 1), password, email }, pool, authInfo))
        .rejects.toThrow();
    });
    test('Username too short', async () => {
      await expect(newUser({ username: '', password, email }, pool, authInfo))
        .rejects.toThrow();
    });
    test('Password too short', async () => {
      await expect(newUser({ username: userID, password: '12', email }, pool, authInfo))
        .rejects.toThrow();
    });
  });
  describe('UserExists', ()=>{
    test('User does exist', async ()=>{
      await expect(userExists(userID,pool)).resolves.toBe(true);
    })
    test('User does not exist', async ()=>{
      await expect(userExists("aaaaaaba",pool)).resolves.toBe(false);
    })
  })
  describe('Get', () => {
    test('No auth', async () => {
      const res = await get(userID, pool, false);
      expect(res).toEqual({ username: userID, email });
    });
    test('No auth supplied', async () => {
      const res = await get(userID, pool);
      expect(res).toEqual({ username: userID, email });
    });
    test('auth', async () => {
      const res = await get(userID, pool, true) as UserRow;
      expect(res).toMatchObject({ username: userID, email });
      expect(res).toHaveProperty('hash');
      expect(res.hash).toHaveLength(config.database.passHashLen * 2);
      expect(res.salt).toHaveLength(config.database.passSaltLen * 2);
    });
    test('invalid ID', async () => {
      await expect(get('hippo', pool, true)).rejects.toThrow();
      await expect(get('hippo', pool, false)).rejects.toThrow();
      await expect(get('', pool, false)).rejects.toThrow();
      await expect(get('#'.repeat(config.database.usernameMaxLength + 1), pool, false)).rejects.toThrow();
    });
  });
  afterAll(async () => {
    await pool.query('DROP TABLE users, moves');
    await pool.end();
    // avoid jest open handle error
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
  });
});
