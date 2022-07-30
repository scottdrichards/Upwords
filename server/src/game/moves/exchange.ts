import { grabTilesFromBag } from './helper';
import { Intent, Result, UpdateGameState } from './move';

type ExchangeLabel = 'exchange';
export interface ExchangeIntent extends Intent<ExchangeLabel>{
  tileIDs: string[]
}
export interface ExchangeResult extends ExchangeIntent, Result<ExchangeLabel>{
  tileIDsFromBag:string[]
}
const exchange:UpdateGameState<ExchangeIntent, ExchangeResult> = async (gsInitial, move) => {
  if (move.tileIDs.length == 0) throw new Error("No tiles specified to exchange");
  if (gsInitial.bag.length < move.tileIDs.length) throw new Error("Not enough tiles in bag to exchange");

  const missingtiles = move.tileIDs.filter(mTile=>
      !gsInitial.players[move.userID].rack.includes(mTile));
  if (missingtiles.length){    
    const single = missingtiles.length !== 1;
    throw new Error(`Move tile${single?'s':''} ${missingtiles.join(", ")}`+
        ` do${single?"":"es"} not exist in player ${move.userID}'s rack`);
  }

  const resultTiles = (move as ExchangeResult).tileIDsFromBag;
  const isIntent = resultTiles === undefined;
  const { bag, grabbed } = isIntent
    ? grabTilesFromBag(gsInitial.bag, move.tileIDs.length, move.gameID + (100 * gsInitial.nextTurn))
  // Not intent, just apply the move
    : {
      bag: gsInitial.bag.filter((bTile) => !resultTiles.includes(bTile)),
      grabbed: resultTiles,
    };

  const moveResult:ExchangeResult = { ...move, tileIDsFromBag: grabbed };

  const player = gsInitial.players[move.userID];
  const newRack = gsInitial.players[move.userID].rack
    .filter((rTile) => !move.tileIDs.includes(rTile))
    .concat(grabbed);
  const newPlayer = { ...player, rack: newRack };
  const newPlayers = { ...gsInitial.players, [move.userID]: newPlayer };
  const newGame = { ...gsInitial, players: newPlayers, bag:[...bag, ...move.tileIDs] };
  return { gameState: newGame, moveResult };
};
export default exchange;
