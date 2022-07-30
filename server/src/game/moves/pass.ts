import { Intent, Result, UpdateGameState } from './move';

type PassLabel = 'pass';
interface PassIntent extends Intent<PassLabel>{}
interface PassResult extends PassIntent, Result<PassLabel>{}
const pass:UpdateGameState<PassIntent, PassResult> = (gsInitial, moveIntent) => Promise.resolve({
  gameState: {...gsInitial,nextTurn:gsInitial.nextTurn++},
  moveResult: { ...moveIntent },
});
export default pass;
