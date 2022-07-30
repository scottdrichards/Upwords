import crypto from 'crypto';
import { RequestHandler } from 'express';
import mysql from 'mysql2/promise';
import { GameStateReady } from '../../../shared/gameTypes';
import * as Database from '../database/database';
import { HandlerError } from '../utils';
import { InitIntent } from './moves/init';
import * as Move from './moves/move';

export default (db:mysql.Pool| mysql.Connection,
  // eslint-disable-next-line no-unused-vars
  updateCache:(cacheBit:{[id:string]:GameStateReady})=>void,
  { gameIDLength }:{ gameIDLength:number }) => {
  const newGame:RequestHandler = async (req, res, next) => {
    const gameID = crypto.randomBytes(
      Math.ceil(gameIDLength / 2), // 1 byte => 2 characters so we round up
    )
      .toString('hex')
      .slice(0, gameIDLength); // We might have added an extra char because of rounding, so just
    // grab the amount we need
    try {
      const moveIntent: InitIntent = {
        type: 'initialization',
        locale: req.body.locale,
        version: req.body.version,
        userID: req.body.userID,
        gameID,
      };
      const { gameState, moveResult } = await Move.applyMove(undefined, moveIntent);
      await Database.addMove({
        gameID, userID: 'server', move: moveResult, db, serverRequest: true,
      });
      updateCache({ [gameID]: gameState });
    } catch (e) {
      throw new HandlerError(e as any, false);
    }
    req.body = {
      type: 'join',
      userID: res.locals.userID,
      includeGameID: true,
    };
    req.url = `/${gameID}`;
    next();
  };
  return newGame;
};
