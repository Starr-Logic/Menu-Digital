import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite'); // point to root database.sqlite

const dbName = process.env.DB_NAME || 'menu_digital_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '123456';
const dbHost = process.env.DB_HOST || '';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const isProduction = process.env.NODE_ENV === 'production';
const useMySQL = Boolean(dbHost) && !(isProduction && dbHost === 'localhost');

let sequelize;
if (useMySQL) {
  console.log(`Configuring Sequelize for MySQL database at ${dbHost}:${dbPort}`);
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
}

export default sequelize;
