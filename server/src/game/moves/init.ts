import { GameStateReady, SupportedLocales } from '../../../../shared/gameTypes';
import { shuffle } from '../../../../shared/utils';
import getTiles from '../../localization/getTiles';
import { Intent, Result, UpdateGameState } from './move';

type InitLabel = 'initialization';
export interface InitIntent extends Intent<InitLabel>{
  locale:SupportedLocales,
  version:string
}
interface InitResult extends InitIntent, Result<InitLabel>{
  bagTiles:string[];
}

type InitType = UpdateGameState<InitIntent|InitResult, InitResult, undefined>
const initialization:InitType = async (_, move:InitIntent) => {
  const bag = shuffle(Object.keys(await getTiles(move.locale, move.version)), move.gameID);
  const gameState:GameStateReady = {
    board: {},
    locale: move.locale,
    version: move.version,
    nextTurn: 0,
    players: {},
    bag,
  };
  return { gameState, moveResult: { ...move, bagTiles: bag } };
};

export default initialization;
