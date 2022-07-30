
import {GameStatePlayerVisibility} from '../../../shared/gameTypes'
import { Bag } from './bag';
import { Board } from './board'
import { Rack } from './rack';

export const Game = ({gameState}:{gameState:GameStatePlayerVisibility})=>{
    return <div className="game">
        <Board boardState={gameState.board}/>

        {gameState.players.sort((a,b)=>a.turnOrder-b.turnOrder).map(({rack,turnOrder,id})=>{
            const tiles = typeof rack === "object"?
                    rack:
                    Array(rack).fill("");

            return Rack({tiles, id, turnOrder})       
        })}

        <Bag count={gameState.bagCount}/>
    </div>
}