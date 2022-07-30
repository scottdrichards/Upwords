import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { Pool } from 'mysql2/promise';
import * as Game from '../../shared/gameTypes';
import { authenticateToken } from './authentication/authentication';
import login from './authentication/login';
import config from './config';
import { newUser } from './database/user/user';
import gameRouter from './game/router';
import getTiles from './localization/getTiles';
import { handlerWrapper } from './utils';

export default (poolPromise: Promise<Pool>) => {
  const app = express();  
  var cors = require('cors');
  app.use(cors({origin: 'http://localhost:3000'}));
  app.use(express.json());
  app.use(cookieParser());
  app.use('/', (req, res, next) => {
    console.log(`A new request received at ${(new Date()).toUTCString()}`);
    console.log(req.url);
    console.log(req.body);
    if (req.body.serverRequest) delete req.body.serverRequest;
    next();
  });

  const authInfo = {
    hashLength: config.database.passHashLen,
    saltLength: config.database.passSaltLen,
    iterations: config.database.iterations,
    digest: config.database.digest,
  };

  app.post('/api/user/newUser', handlerWrapper(async (req) => newUser(req.body, await poolPromise, authInfo)));

  app.get('/api/authenticate', handlerWrapper(async (req) => {
    const { userID, password } = req.body;
    const authtoken = authenticate(await poolPromise, userID, password, authInfo);
    return { authtoken };
  }));

  app.use('/api/game', authenticateToken);
  app.use('/api/game', async () => {
    gameRouter(await poolPromise, { gameIDLength: config.database.gameIDLength });
  });

  app.get('/api/tileSet/:locale/:version?', handlerWrapper((req) => {
    const { params } = req;
    const tileMap = getTiles(params.locale as Game.SupportedLocales, params.version);
    // console.log(tileMap);
    return tileMap;
  }));
  return app;
};
