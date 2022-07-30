import mysql from 'mysql2';

export default () => mysql.createPool({
  host: process.env.DBHOST,
  port: +(process.env.DBPORT as string),
  user: process.env.DBUSER,
  password: process.env.DBPWD,
  database: process.env.DBNAME,
  connectionLimit: 10,
  supportBigNumbers: true,
});
