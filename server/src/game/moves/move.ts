import { GameState, GameStateReady } from '../../../../shared/gameTypes';
import { HandlerError } from '../../utils';
import addPlayer from './addPlayer';
import exchange from './exchange';
import initialization, { InitIntent } from './init';
import pass from './pass';
import place from './placeTiles';

export type UpdateGameState<
  _Intent,
  _Result,
  GsInitial extends GameState = GameStateReady,
  GsFinal extends GameState = GameStateReady
  // eslint-disable-next-line no-unused-vars
> = (gameStateInitial:GsInitial, move:_Intent|_Result)=>Promise<{
  gameState:GsFinal,
  moveResult:_Result
}>;

export const playerMoves = {
  pass,
  exchange,
  place,
};

export const serverMoves = {
  initialization,
  addPlayer,
};
const allMoves = { ...playerMoves, ...serverMoves };
type ServerMoveTypes = keyof typeof serverMoves
type PlayerMoveTypes = keyof typeof playerMoves;
type MoveTypes = PlayerMoveTypes | ServerMoveTypes;

interface Prototype<T>{
  userID:string,
  gameID:string,
  type:T
}
export interface Intent<T = MoveTypes> extends Prototype<T>{}
export interface Result<T = MoveTypes> extends Prototype<T>{}

export const applyMove = async (gsInitial:GameState, moveIntent: Intent<MoveTypes>) => {
  if (moveIntent.type === 'initialization') { return initialization(undefined, moveIntent as InitIntent); }

  if (gsInitial === undefined) { throw new HandlerError('GameState is undefined!', false); }
  if (!Object.keys(allMoves).includes(moveIntent.type)) { throw new HandlerError(`${moveIntent.type} not included in moves`, false); }

  const isPlayerMove = Object.keys(playerMoves).includes(moveIntent.type);
  if (isPlayerMove) {
    // Validate turn order
    const currentTurn = (gsInitial.nextTurn || 0) % Object.values(gsInitial.players).length;
    const playerOrder = gsInitial.players[moveIntent.userID].turnOrder;
    if (currentTurn !== playerOrder) throw new HandlerError(`Not player ${moveIntent.userID}'s turn`);
  }

  // Apply move
  const moveFunction = allMoves[moveIntent.type] as UpdateGameState<Intent, Result>;
  if (!moveFunction) throw new HandlerError(`Move type ${moveIntent.type} invalid`);
  const { gameState: gsAfterMove, moveResult } = await moveFunction(gsInitial, moveIntent);

  // Update turn order
  const gameState = isPlayerMove
    ? { ...gsAfterMove, next: gsAfterMove.nextTurn + 1 }
    : gsAfterMove;

  return { gameState, moveResult };
};

/**
 * Iterates through each move and apply it
 */
export const getGameState = (moves:Result[]) => moves.reduce(async (
  gameState: Promise<GameState>,
  move,
) => {
  const result = await applyMove(await gameState, move);
  return result.gameState;
},
Promise.resolve(undefined));
