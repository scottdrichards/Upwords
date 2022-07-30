import { HandlerError } from '../../utils';
import { getWordStacks, grabTilesFromBag } from './helper';

describe('grabbing tiles from bag', () => {
  const seed = 123;
  test('empty bag', () => {
    expect(() => grabTilesFromBag([], 1, seed)).toThrow(HandlerError);
  });
  test('Grab one and empty', () => {
    const { bag, grabbed } = grabTilesFromBag(['1'], 1, seed);
    expect(bag).toEqual([]);
    expect(grabbed).toEqual(['1']);
  });
  test('Request 2 and there is only 1 to get', () => {
    expect(() => grabTilesFromBag(['1'], 2, seed)).toThrow(HandlerError);
  });
  test('Request 1 and there are 2 to get', () => {
    const initialBag = ['1', '2'];
    const { bag, grabbed } = grabTilesFromBag(initialBag, 1, seed);
    expect(bag).toHaveLength(1);
    expect(grabbed).toEqual(['2']);
    expect(bag).not.toBe(initialBag);
  });
  test('That bag object is not reused', () => {
    const initialBag = ['1', '2'];
    const { bag, grabbed } = grabTilesFromBag(initialBag, 1, seed);
    expect(bag).not.toBe(initialBag);
    expect(grabbed).not.toBe(initialBag);
  });
});

describe('Get word stacks',()=>{
  const boardState = {
    0:{
      0:['a','b','c'],
      1:['d','e','f'],
      2:['g','h','i'],
    },
    1:{
      0:['j','k','l'],
      1:['m','n','o'],
      2:['p','q','r'],
      3:['s','t','u'],
    },
  };

  test('Empty game', ()=>{
    expect(getWordStacks({},0,0,true)).toEqual([]);
    expect(getWordStacks({},1,1,false)).toEqual([]);
  });
  
  test('Bad index', ()=>{
    expect(getWordStacks( boardState,-1,1,false)).toEqual([]);
    expect(getWordStacks( boardState,1,Infinity,false)).toEqual([]);
  });

  test('Index out of range', ()=>{
    expect(getWordStacks( boardState,3,3,false)).toEqual([]);
  });
  
  test('Single stack', ()=>{
    expect(getWordStacks( {0:{0:['a']}},0,0,false)).toEqual([['a']]);
    expect(getWordStacks( {0:{0:['a']}},0,0,true)).toEqual([['a']]);
  });

  test('Word stacks horizontal', ()=>{
    expect(getWordStacks(boardState,1,1,false)).toEqual([
      ['d','e','f'],
      ['m','n','o']
    ]);
    expect(getWordStacks(boardState,1,3,false)).toEqual([
      ['s','t','u']
    ]);
  })

  test('Word stacks vertical', ()=>{
    expect(getWordStacks(boardState,1,1,true)).toEqual([
      ['j','k','l'],
      ['m','n','o'],
      ['p','q','r'],
      ['s','t','u'],
    ]);
    expect(getWordStacks(boardState,0,2,true)).toEqual([
      ['a','b','c'],
      ['d','e','f'],
      ['g','h','i'],
    ]);
  })
})