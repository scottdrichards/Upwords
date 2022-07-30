import mysql, { RowDataPacket } from 'mysql2/promise';
import * as Move from '../game/moves/move';
import { MYSQL_USER_ID, USER_ROW_FIELDS } from './user/user';

const MOVE_TABLE_NAME = 'moves';
const END_GAME_TOKEN = 'end';

export interface initParams{
  host:string,
  port:number,
  user:string,
  password:string,
  database: string,
  gameIDLength: number,
  usernameMaxLength: number,
  emailMaxLength: number,
  passHashLen: number
}

export const MOVE_ROW_FIELDS = ({ usernameMaxLength, gameIDLength }:Pick<initParams, 'usernameMaxLength'|'gameIDLength'>) => ({
  id: {
    type: 'int',
    modifiers: ['NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
  },
  time: {
    type: 'TIMESTAMP',
  },
  ...MYSQL_USER_ID(usernameMaxLength),
  game_id: {
    type: `CHAR(${gameIDLength})`,
  },
  description: {
    type: 'JSON',
  },
});

export const initialize = async (params:initParams) => {
  // Validate
  Object.entries(params).forEach(([key, val]) => {
    if (val === undefined) throw new Error(`${key} not set`);
  });

  const mysqlParamKeys = ['connectionLimit', 'host', 'user', 'password',
    'database', 'debug'];
  const poolParams = Object.fromEntries(Object.entries(params)
    .filter(([k]) => mysqlParamKeys.includes(k)));
  const pool = mysql.createPool(poolParams);

  // Test
  try {
    const conn = await pool.getConnection();
    // console.log('Succesfully connected to database');
    conn.release();
  } catch (e) {
    throw e;
    // console.log(`Could not connect to database\n ${e}`);
  }

  const tableDefinitions = {
    moves: MOVE_ROW_FIELDS(params),
    users: USER_ROW_FIELDS(params),
  };

  await Promise.all(Object.entries(tableDefinitions).map(([table, fields]) => `CREATE TABLE IF NOT EXISTS ${table}(${
    Object.entries(fields).map(([fieldName, fieldProps]) => [
      fieldName,
      fieldProps.type,
      ...('modifiers' in fieldProps)
      // @ts-ignore
        ? fieldProps.modifiers
        : [],
    ].join(' ')).join(', ')
  })`).map(async (queryString) => {
    const qRes = await pool.query(queryString);
    return qRes;
  }));
  return pool;
};

const activeGamesQS = () => `SELECT game_id FROM ${MOVE_TABLE_NAME} WHERE description <> "${END_GAME_TOKEN}"`;
const joinQueries = (q1:string, q2:string) => `SELECT * FROM (${q1}) as t1 INNER JOIN (${q2}) as t2 USING (game_id)`;
const userGamesQS = (userID:string, active = true) => {
  const userGames = `SELECT game_id FROM ${MOVE_TABLE_NAME} WHERE username = "${userID}"`;
  return active ? joinQueries(userGames, activeGamesQS()) : userGames;
};

interface _getMovesRequest{
  db: mysql.Connection|mysql.Pool,
  gameID:string,
  active?:true,
}
interface getMovesRequestServer extends _getMovesRequest{
  serverRequest:true,
}
interface getMovesRequestUser extends _getMovesRequest{
  userID:string,
}
export type getMovesParams = getMovesRequestServer|getMovesRequestUser;
export const getMoves = async ({
  db, gameID, active, ...req
}:getMovesParams) => {
  const query = `SELECT * FROM ${MOVE_TABLE_NAME} WHERE game_id = '${gameID}'${
    (req as getMovesRequestServer).serverRequest ? ''
      : ` AND game_id IN(${userGamesQS((req as getMovesRequestUser).userID, active)})`}`;

  // console.log(`Getting moves from Database:\n${query}`);
  interface MoveRow extends RowDataPacket{
    description:Move.Result
  }
  const [rows] = await db.query<MoveRow[]>(query);
  const moves = rows.map((r) => r.description);
  return moves;
};

type Params = {
  db: mysql.Connection|mysql.Pool;
  userID: string;
  active?: any;
};

export const getGames = async ({
  db, userID, active,
}:Params) => {
  const query = userGamesQS(userID, active);
  interface GameIDRows extends RowDataPacket{
    // eslint-disable-next-line camelcase
    game_id:string
  }
  const [rows] = await db.query<GameIDRows[]>(query);
  const gameIDs = rows.map((r) => r.game_id);
  return gameIDs;
};

type addMoveParams = {
  gameID: string;
  userID: string;
  db: mysql.Connection|mysql.Pool;
  move: Move.Result;
  serverRequest?: true;
};

export const addMove = async (params:addMoveParams) => {
  const accesCheck = params.serverRequest || await getGames({ ...params, ...{ active: true } })
    .then((gameIDs) => gameIDs.some((id) => id === params.gameID));

  if (!accesCheck) throw ({ error: `${params.userID} has no associated game ${params.gameID}`, public: true });

  const valstring = [`'${params.userID}'`, `'${params.gameID}'`, mysql.escape(JSON.stringify(params.move))].join(',');
  const query = `INSERT INTO ${MOVE_TABLE_NAME} (username, game_id, \`description\`) VALUES (${valstring})`;
  const rows = await params.db.query(query);
  return rows;
};
