import { SupportedLocales, TileMap } from '../../../shared/gameTypes';
import { HandlerError } from '../utils';
import enTiles from './en/tiles';

export default async (locale:SupportedLocales = 'en', version:string|undefined = undefined)
:Promise<TileMap> => {
  if (locale !== 'en') { throw new HandlerError(`Locale ${locale} is not supported`, true); }
  if (version !== undefined) { throw new HandlerError('Versioning not supported yet', true); }

  const tiles = enTiles.tiles.flatMap(({ value, count }) => Array(count).fill(value)) as string[];
  return Object.fromEntries(tiles.map((v, i) => ([locale + i, v])));
};
