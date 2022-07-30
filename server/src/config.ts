require('dotenv').config();

const getEnv=(name:string, defaultVal:number|string|undefined=undefined)=>{
  const value = process.env[name]||defaultVal;
  if (value === undefined) throw new Error(`Environmental variable ${name} not set`);
  return ""+value;
}

export default {
  port: +getEnv("PORT"),
  database: {
    database: getEnv("MYSQL_DATABASE"),
    host: getEnv("MYSQL_ADDRESS"),
    password: getEnv("MYSQL_PASSWORD"),
    port: +getEnv("MYSQL_PORT"),
    user: getEnv("MYSQL_USER"),
    gameIDLength: +getEnv("GAME_ID_LENGTH", 10),
    usernameMaxLength: +getEnv("USER_ID_LENGTH", 20),
    emailMaxLength: +getEnv("USER_ID_LENGTH", 254), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
    passHashLen: +getEnv("HASH_LENGTH", 32),
    passSaltLen: +getEnv("SALT_LENGTH", 32),
    iterations: +getEnv("SALT_LENGTH", 1000),
    digest: getEnv("HASH_DIGEST", 'sha512'),
  },
  accessToken:{
    secret: getEnv("ACCESS_TOKEN_SECRET"),
    refresh: getEnv("ACCESS_TOKEN_REFRESH")
  }
};
