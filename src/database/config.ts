import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PGL_HOST,
  port: parseInt(process.env.PGL_PORT || '5432'),
  username: process.env.PGL_USUARIO,
  password: process.env.PGL_SENHA,
  database: process.env.PGL_BANCO,
  synchronize: true,
  logging: true,
  entities: [
    User
  ],
  migrations: [
  ],
  subscribers: [],
});

export default AppDataSource;
