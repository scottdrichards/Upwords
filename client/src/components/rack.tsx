export const Rack = (props:{tiles:string[], id:string, turnOrder:number})=>{
    return <div className="rack">
        {props.tiles.map(tile=>(<div>{tile}</div>))}
    </div>
}