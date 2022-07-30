import { GameStateReady } from '../../../../shared/gameTypes'; 
import getTiles from '../../localization/getTiles';
import addPlayer, { AddPlayerIntent, MAX_PLAYER_COUNT } from './addPlayer';

describe('Add player', () => {
  let gs:GameStateReady;
  beforeAll(async () => {
    gs = {
      locale: 'en',
      version: '1',
      nextTurn: 0,
      bag: Object.keys(await getTiles('en')),
      players: {},
      board: {},
    } as GameStateReady;
  });
  test('Empty bag', async () => {
    const gameState = { ...gs, ...{ bag: [] } };
    await expect(addPlayer(gameState, { userID: 'test' } as AddPlayerIntent)).rejects.toThrow();
  });

  test('Add up to limit of players', async () => {
    for (let i = 0; i < MAX_PLAYER_COUNT; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const result = await addPlayer(gs, { userID: `${i}` } as AddPlayerIntent);
      gs = result.gameState;
      const { moveResult } = result;
      expect(Object.entries(gs.players)).toHaveLength(i + 1);
      expect(moveResult.turnOrder).toEqual(i);
    }
  });

  test('Add too many players', async () => {
    await expect(addPlayer(gs, { userID: '5' } as AddPlayerIntent)).rejects.toThrow();
  });

  test('Add player after turn taken', async () => {
    delete gs.players[3];
    gs.nextTurn = 5;
    await expect(addPlayer(gs, { userID: 'final player' } as AddPlayerIntent)).rejects.toThrow();
  });
});
