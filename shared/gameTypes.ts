export interface GameStatePlayerVisibility{
    playerID:string,
    playerRack:string[],
    nextTurn:number,
    bagCount:number,
    players:{
        id:string
        turnOrder:number,
        rack:number|string[],
        points:number
    }[],
    board:BoardState,
    tiles:TileMap,
}

export interface BoardState {
    [x: string]: {
        [y: string]: string[]
    }
}

export interface TileMap {
    [id: string]: string
}

export type SupportedLocales = "en"

/**
 * @turnNumber The next turn. So after 2 turns, the turn number will be 2 (0 indexed). Does not loop
 * @bag An array of TileIDs
 */
export interface GameStateReady{
    locale:SupportedLocales,
    version:string,
    nextTurn:number,
    bag:string[],
    players:{[id:string]:PlayerState},
    board:BoardState
}
export type GameState = undefined|GameStateReady;

export interface PlayerState{
    id:string,
    turnOrder:number,
    rack:string[],
    points:number
}