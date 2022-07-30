import Dictionary from '../../../../shared/dictionary';
import { GameStateReady, PlayerState } from '../../../../shared/gameTypes';
import getTiles from '../../localization/getTiles';
import { HandlerError } from '../../utils';
import { getWordStacks, grabTilesFromBag, WordStacks } from './helper';
import { Intent, Result, UpdateGameState } from './move';

interface Placement{
  tileID:string,
  x:number,
  y:number
}
type PlaceLabel = 'place';
interface PlaceIntent extends Intent<PlaceLabel>{
  placements:Placement[]
}
interface PlaceResult extends PlaceIntent, Result<PlaceLabel>{
  tileIDsFromBag:string[]
}

const MAX_STACK_SIZE = 5;
const SINGLE_LAYER_BONUS = 2;

const place:UpdateGameState<PlaceIntent, PlaceResult> = async (gsInitial, move) => {
  const player = gsInitial.players[move.userID];

  // Place each tile
  const gameResult = move.placements.reduce((gs, { x, y, tileID }) => {
    const oldBoard = gs.board;
    const oldStack = oldBoard[x]?.[y] || [];
    const newStack = [...oldStack, tileID];
    const newColumn = { ...oldBoard[x], [y]: newStack };
    const newBoard = { ...oldBoard, [x]: newColumn };
    const oldRack = gs.players[move.userID].rack;
    const newRack = oldRack.filter((rTiles) => rTiles !== tileID);
    const newPlayer = { ...gs.players[move.userID], rack: newRack };
    const newPlayers = { ...gs.players, [move.userID]: newPlayer };
    // Validate
    if (newRack.length !== oldRack.length - 1) throw new HandlerError(`tileID ${tileID} not in rack`, true);
    if (newStack.length >= MAX_STACK_SIZE) throw new HandlerError(`Stack is ${newStack.length}, which is above the limit of ${MAX_STACK_SIZE}`);

    return { ...gs, board: newBoard, players: newPlayers };
  },
  gsInitial);

  // Check if two placements share the same column
  const vertical = move.placements[0].x === move.placements[1]?.x;
  // Get word stacks that are aligned
  const alignedWordStacks = getWordStacks(gameResult.board,
    move.placements[0].x,
    move.placements[0].y,
    vertical);

  // Verify that all placements are within the aligned word (aligned word
  // stack is created based on one tile)
  const alignedWordIDs = alignedWordStacks.map((stack) => stack[stack.length - 1]);
  move.placements.forEach(({ tileID }) => {
    if (!alignedWordIDs.includes(tileID)) {
      throw new HandlerError(`Tile ${tileID} is not in line with other tile${
        move.placements.length > 2 ? 's' : ''}`);
    }
  });

  const orthogonalWordsStacks = move.placements.reduce(
    (stacks, { x, y }) => [...stacks, getWordStacks(gameResult.board, x, y, !vertical)],
    [] as WordStacks[],
  ).filter((wordStacks) => wordStacks.length > 1);

  const allStacks = [alignedWordStacks, ...orthogonalWordsStacks];

  /// /////////////////////////////////////////////////////////////////
  /// Calculate Points
  /// /////////////////////////////////////////////////////////////////
  const points = allStacks
    // We only want words that are more than one letter
    .filter((word) => word.length > 1)
    .reduce((runningTotal, wordStacks) => {
      const wordPoints = wordStacks.map((stack) => stack.length)
        .reduce((sum, stackSize) => sum + stackSize, 0);
      const singleLayer = wordPoints === wordStacks.length;
      return runningTotal + (singleLayer ? SINGLE_LAYER_BONUS : 1) * wordPoints;
    }, 0);

  /// /////////////////////////////////////////////////////////////////
  /// Final Validation
  /// /////////////////////////////////////////////////////////////////
  const wordValidation = getTiles(gsInitial.locale, gsInitial.version).then((tileSet) => {
    allStacks.forEach((wordStack) => {
      const word = wordStack.map((stack) => tileSet[stack[stack.length - 1]]).join('');
      if (!Dictionary.some((d) => d.localeCompare(word, undefined, { sensitivity: 'accent' }))) {
        throw new HandlerError(`${word} is not a word`, true);
      }
    });
    return true;
  });

  const firstPlacement = Object.keys(gsInitial.board).length === 0;
  if (firstPlacement) {
    // If it is the first turn, you just need to make sure multiple tiles are placed
    if (move.placements.length === 1) { throw new HandlerError('Single-letter words do not count'); }
  } else {
    // Not the first turn

    // Did you completely overwrite a word?
    const sameLength = alignedWordStacks.length === move.placements.length;
    const prevWord = alignedWordStacks.filter((stack) => stack.length > 1).length > 1;
    if (sameLength && prevWord) { throw new HandlerError('Cannot completly overwrite a word'); }

    // Did you connect to the rest of the board?
    const sideConnections = orthogonalWordsStacks.length; /* accord => accord
                                                                       c
                                                                       t       */
    const buildOnOthers = alignedWordStacks.some((stack) => stack.length > 1); // act -> ant
    const growAlignedWord = alignedWordStacks.length === move.placements.length; // act -> actor
    if (!sideConnections && !buildOnOthers && !growAlignedWord) throw new HandlerError('Must connect to established pieces');
  }

  if (points === 0) throw new HandlerError('Move results in 0 points');

  /// /////////////////////////////////////////////////////////////////
  /// Create Result Value
  /// /////////////////////////////////////////////////////////////////
  const { bag, grabbed } = (move as PlaceResult).tileIDsFromBag
    ? {
      bag: gsInitial.bag.filter((bagTile) => !(move as PlaceResult).tileIDsFromBag
        .find((rackTile) => rackTile === bagTile)),
      grabbed: (move as PlaceResult).tileIDsFromBag,
    }
    : grabTilesFromBag(gsInitial.bag, move.placements.length,
      move.gameID + (100 * Object.keys(gsInitial.players).length));

  const newPoints = player.points + points;

  const newPlayer:PlayerState = {
    ...player,
    points: newPoints,
    rack: player.rack.filter((rTile) => !move.placements
      .map((p) => p.tileID)
      .includes(rTile)).concat(grabbed),
  };
  const newPlayers = { ...gsInitial.players, [newPlayer.id]: newPlayer };
  const newGameState:GameStateReady = {
    ...gsInitial,
    board: gameResult.board,
    players: newPlayers,
    bag,
  };
  // We have to wait for word validation to complete
  await wordValidation;
  return { gameState: newGameState, moveResult: { ...move, tileIDsFromBag: grabbed } };
};
export default place;
