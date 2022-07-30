import React from 'react'
import {BoardState} from '../../../shared/gameTypes'

const BOARD_ROWS = 10;
const BOARD_COLUMNS = BOARD_ROWS;

export const Board = (props:{boardState:BoardState})=>{
    return <div className="board">
    {Array(BOARD_ROWS).map((_,rowIndex)=>
        Array(BOARD_COLUMNS).map((_,colIndex)=>{
            const tiles = props.boardState[rowIndex]?.[colIndex]||[];
            return <div className="location">
                {tiles.map(tile=>(<div className="tile">{tile}</div>))}
            </div>
        })
    )}
    </div>
}