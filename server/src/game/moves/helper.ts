import {
  BoardState,
} from '../../../../shared/gameTypes';
import { shuffle } from '../../../../shared/utils';
import { HandlerError } from '../../utils';

export const grabTilesFromBag = (bag:string[], count:number, seed:string|number) => {
  if (count > bag.length) throw new HandlerError(`Cannot exchange ${count} tiles, only ${bag.length} left in bag!`);
  const bagShuffled = shuffle(bag, seed);
  const grabbed = bagShuffled.slice(0, count);
  const bagRemaining = bagShuffled.slice(count);
  return { bag: bagRemaining, grabbed };
};

type Stack = string[]
export type WordStacks = Stack[]
export const getWordStacks = (boardState:BoardState,
  x:number,
  y:number,
  vertical:boolean) => {
  const wordStacks:WordStacks = [];
  let max = vertical ? y : x;
  let min = max - 1;

  while (boardState[vertical ? x : min]?.[vertical ? min : y]) {
    wordStacks.unshift(boardState[vertical ? x : min][vertical ? min : y]);
    min -= 1;
  }
  while (boardState[vertical ? x : max]?.[vertical ? max : y]) {
    wordStacks.push(boardState[vertical ? x : max][vertical ? max : y]);
    max += 1;
  }
  return wordStacks;
};
