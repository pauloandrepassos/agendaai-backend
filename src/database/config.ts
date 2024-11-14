import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { PendingUser } from '../models/PendigUser';
import { EstablishmentRequest } from '../models/EstablishmentRequest';

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
    User,
    PendingUser,
    EstablishmentRequest
  ],
  migrations: [
  ],
  subscribers: [],
});

export default AppDataSource;
