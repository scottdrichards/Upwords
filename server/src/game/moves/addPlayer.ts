import getTiles from '../../localization/getTiles';
import { HandlerError } from '../../utils';
import { grabTilesFromBag } from './helper';
import { Intent, UpdateGameState } from './move';

export interface AddPlayerIntent extends Intent<'addPlayer'>{
  userID:string,
}
interface AddPlayerResult extends AddPlayerIntent{
  turnOrder:number,
  rack:string[]
}

export const MAX_PLAYER_COUNT = 4;
export const MAX_RACK_SIZE = 7;

const addPlayer:UpdateGameState<AddPlayerIntent, AddPlayerResult> = async (gs, move) => {
  // If game exists (bag is full) then use gs, otherwise get tiles
  const gsInitial = gs?.bag?.length ? gs : (() => {
    const tiles = getTiles('en');
    return {
      ...gs,
      players: {},
      bag: Object.keys(tiles),
      board: {},
      nextTurn: 0,
      tiles,
    };
  })();

  const playerCount = Object.keys(gsInitial.players).length;

  if (gsInitial.players[move.userID]) { throw new HandlerError(`Player ${move.userID} already in game`); }
  if (playerCount >= MAX_PLAYER_COUNT) { throw new HandlerError(`Game already has ${MAX_PLAYER_COUNT} players`); }
  if (gsInitial.nextTurn > playerCount) { throw new HandlerError('Cannot add player because an active player has already taken a second turn'); }

  const { bag, grabbed } = grabTilesFromBag(
    gsInitial.bag, MAX_RACK_SIZE, move.gameID + (100 * playerCount),
  );

  const turnOrder = playerCount;

  return {
    gameState: {
      ...gsInitial,
      players: {
        ...gsInitial.players,
        [move.userID]: {
          id: move.userID,
          points: 0,
          rack: grabbed,
          turnOrder,
        },
      },
      bag,
    },
    moveResult: {
      ...move,
      ...{
        turnOrder,
        rack: grabbed,
      },
    },
  };
};

export default addPlayer;
