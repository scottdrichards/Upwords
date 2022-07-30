const getEnv = (name:string, defaultVal:number|string|undefined = undefined)=>{
    const value = process.env["REACT_APP_"+name]||defaultVal;
    if (value === undefined) throw new Error(`Environmental variable ${name} not set`);
    return ""+value;
};

const config = {
    domain: getEnv("API_DOMAIN"),
    port: getEnv("API_PORT")        
}

export default config;