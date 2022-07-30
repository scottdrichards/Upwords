import getTiles from './getTiles';
import enTiles from './en/tiles';

describe('Get tiles', () => {
  test('No inputs', async () => {
    const tiles = await getTiles();
    const tileCounts = enTiles.tiles.map((t) => t.count).reduce((acc, cur) => acc + cur, 0);
    expect(Object.keys(tiles)).toHaveLength(tileCounts);
    const tileIDs = new Set(Object.keys(tiles));
    expect(tileIDs.size).toEqual(tileCounts);
  });
});
