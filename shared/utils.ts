import MersenneTwister from "./mersenneTwister"
/**
 * Creates a new array from sourceArray that excludes elements found in remove
 * array. Created because the syntax can be difficult to read
 */
export const filterArray = <T>(sourceArray:T[], removeArray:T[])=>{
    return sourceArray.filter(sEl=>!removeArray.some(rEl=>rEl===sEl));
}

// export const functionalCombine = (sourceObject:{}, changes:{})=>{
//     const recurse = (srcEntries:[],destEntries:[])=>{
//         const resultEntries = srcEntries.map((k,v)=>{
//             if (!destEntries.some((dK,dV)=>dK===k)){
//                 // No change
//                 return [k,v];
//             }else if (!Array.isArray(v) && (typeof v === "object")){
//                 return [k,functionalCombine(v,destEntries[k])];
//             }else if 
            
//         })
//     }
// }

// export const validateEmail = (email:string)=>{
//     const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
//     return emailRegex.test(email);
// }

export const shuffle = <T>(array:T[],seed:string|number)=>{
    if (typeof seed === 'string'){
        seed = seed.split('').reduce((acc,cur)=>acc+cur.charCodeAt(0),0);
    }
    const ms = new MersenneTwister(seed);

    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex) {

        // Pick a remaining element...
        randomIndex = ms.genrand_int32()%currentIndex;
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}