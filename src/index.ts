import express from 'express';
import router from './routes';
import cors from 'cors';
import timezoneMiddleware from './middlewares/timezone';

const app = express()

app.use(express.json())

app.use(cors());

app.use(timezoneMiddleware)

app.use("/", router)

export default app