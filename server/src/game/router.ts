import express from 'express';
import mysql from 'mysql2/promise';
import * as Game from '../../../shared/gameTypes';
import * as Database from '../database/database';
import { HandlerError, handlerWrapper } from '../utils';
import * as Move from './moves/move';
import newGame from './newGame';

const router = express.Router();
export interface StateCache {
  [gameID: string]: Game.GameStateReady;
}

export default (db: mysql.Pool| mysql.Connection, { gameIDLength }:{gameIDLength:number}) => {
  let cache:StateCache = {};

  const getGameState = async (req: Database.getMovesParams,
    stateCache: StateCache) => stateCache[req.gameID]
            || (async () => {
              const moves = await Database.getMoves(req);
              const gameState = await Move.getGameState(moves);
              cache[req.gameID] = gameState as Game.GameStateReady;
              return gameState;
            })();

  const prepGameStateForTX = (gameState: Game.GameStateReady, userID: string,
    gameID?: string|undefined) => {
    const players = Object.fromEntries(Object.entries(gameState.players).map(
      ([playerID, playerState]) => [playerID,
        playerID === userID
          ? playerState
          : {
            ...playerState,
            rack: playerState.rack.length,
          },
      ],
    ));
    return {
      ...gameState,
      players,
      bag: gameState.bag.length,
      ...(gameID ? { gameID } : {}),
    };
  };

  router.get('/:gameID', handlerWrapper(async (req) => {
    const { userID } = req.cookies;
    const gs = await getGameState({ db, userID, gameID: req.params.gameID }, cache);
    return prepGameStateForTX(gs, userID);
  }));

  router.post('/new', newGame(db, (cacheUpdate) => {
    cache = { ...cacheUpdate, ...cacheUpdate };
  }, { gameIDLength }));

  router.post('/:gameID', handlerWrapper(async (req) => {
    const { gameID } = req.params;
    const isJoin = req.body.type === 'join';
    const { userID } = req.body;
    const { includeGameID } = req.body;
    const gameStateInitial = await getGameState({
      db, gameID, active: true, ...isJoin ? { serverRequest: true } : { userID },
    }, cache);

    if (gameStateInitial === undefined) {
      throw new HandlerError('Unable to get game', false);
    }

    const { gameState, moveResult } = await Move.applyMove(gameStateInitial, { ...req.body, ...isJoin ? { type: 'addPlayer' } : {} });
    await Database.addMove({
      ...{
        gameID, userID, move: moveResult, db,
      },
      ...isJoin ? { serverRequest: true } : {},
    });
    cache[gameID] = gameState;
    return prepGameStateForTX(gameState, req.body.userID, includeGameID && gameID);
  }));

  router.get('/:gameID/:moveNumber', handlerWrapper(async (req) => {
    const { gameID } = req.params;
    const moveNumber = +req.params.moveNumber;
    const moves = await Database.getMoves({ db, ...req.body, gameID });
    if (moves.length >= moveNumber) {
      const msg = `Move ${moveNumber} has not been registered yet or you do not have access to this game`;
      throw new HandlerError(msg, true);
    }
    return moves[moveNumber];
  }));

  return router;
};
