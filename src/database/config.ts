import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  username: process.env.PG_USUARIO,
  password: process.env.PG_SENHA,
  database: process.env.PG_BANCO,
  synchronize: false, //alterar para true para gerar a entidade
  logging: true,
  entities: [
    User
  ],
  migrations: [
  ],
  subscribers: [],
});

console.log(process.env.PG_HOST)
export default AppDataSource;
