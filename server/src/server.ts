import app from './app';
import config from './config';
import * as Database from './database/database';
import cors from 'cors'

const poolPromise = Database.initialize(config.database as Database.initParams);

const expressInstance = app(poolPromise);
expressInstance.use(cors());
expressInstance.listen(config.port, () => console.log(`Listening on ${config.port}`));
