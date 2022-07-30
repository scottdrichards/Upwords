import request from 'supertest';

import application from './app';
import config from './config';
import * as Database from './database/database';

describe('Test app', () => {
  const poolPromise = Database.initialize(config.database as Database.initParams);
  const app = application(poolPromise);

  describe('/newUser', () => {
    test('Missing password', (done) => {
      request(app)
        .post('/api/user/newUser')
        .send({
          userID: 'howdydo',
          email: 'Email@hotmail.com',
        })
        .expect(400, done);
    });
    test('Bad password', (done) => {
      request(app)
        .post('/api/user/newUser')
        .send({
          userID: 'howdydo',
          password: 'a',
          email: 'Email@hotmail.com',
        })
        .expect(400, done);
    });
    test('Missing userID', (done) => {
      request(app)
        .post('/api/user/newUser')
        .send({
          password: 'howdydo',
          email: 'Email@hotmail.com',
        })
        .expect(400, done);
    });
    test('Missing eMail', (done) => {
      request(app)
        .post('/api/user/newUser')
        .send({
          userID: 'howdydo',
          password: 'howdydo',
        })
        .expect(400, done);
    });
    test('Invalid eMail', (done) => {
      request(app)
        .post('/api/user/newUser')
        .send({
          userID: 'howdydo',
          password: 'howdydo',
          email: 'Email',
        })
        .expect(400, done);
    });
    test('Register valid', (done) => {
      request(app)
        .post('/api/user/newUser')
        .set('Content-Type', 'application/json')
        .send({
          userID: 'testUser',
          password: 'passwrd',
          email: 'Email@gmail.com',
        })
        .set('Accept', 'application/json')
        .expect(200, done);
    });
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool.query('DROP TABLE users, moves');
    pool.end();
  });
});
