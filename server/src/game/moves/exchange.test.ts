import { GameStateReady } from "../../../../shared/gameTypes"
import exchange, { ExchangeIntent} from "./exchange"

describe("Exchange",()=>{
    const gameState:GameStateReady = {
        bag:['a','b'],
        board:{},
        locale:"en",
        nextTurn:3,
        players:{
            "0":{
                id:"0",
                points:5,
                rack:["d","e","f"],
                turnOrder:0
            },
            "1":{
                id:"1",
                points:5,
                rack:["g","h","i"],
                turnOrder:1
            }
        },
        version:"a"
    }

    const moveIntent:ExchangeIntent = {gameID:"1",tileIDs:["h","i"],type:"exchange",userID:"1"};

    test("Wrong turn",async ()=>{        
        const intent:ExchangeIntent = {gameID:"1",tileIDs:["d","e"],type:"exchange",userID:"1"};
        await expect(exchange(gameState, intent)).rejects.toBeInstanceOf(Error);
    })
    test("No tiles selected",async ()=>{        
        const intent:ExchangeIntent = {gameID:"1",tileIDs:[],type:"exchange",userID:"1"};
        await expect(exchange(gameState, intent)).rejects.toBeInstanceOf(Error);
    })
    test("No tiles available",async ()=>{        
        await expect(exchange({...gameState,bag:[]}, moveIntent)).rejects.toBeInstanceOf(Error);
    })

    test("Intent exchange", async ()=>{
        const {gameState:gs, moveResult:mr } = await exchange(gameState,moveIntent); 
        moveIntent.tileIDs.forEach(tile=>{
            expect(gs.bag).toContain(tile)
        });
        mr.tileIDsFromBag.forEach(tile=>{
            expect(gs.bag).not.toContain(tile);
            expect(mr.tileIDs).not.toContain(tile);
        });        
    });

    test("Exchange completed",async () => {
        const move = {...moveIntent,tileIDsFromBag:['a']};
        const {gameState:gs, moveResult} = await exchange(gameState, move);
        move.tileIDsFromBag.forEach(tile=>
            expect(gs.bag).not.toContain(tile));
        expect(moveResult).toEqual(move);
    })
})