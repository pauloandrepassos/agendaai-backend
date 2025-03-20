import express from 'express';
import router from './routes';
import cors from 'cors';
import timezoneMiddleware from './middlewares/timezone';
import swaggerDocument from './swagger.json';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(express.json());

const corsOptions = {
    origin: ['https://agendaai.vercel.app', 'http://localhost:3000', 'https://agendeaii.com.br'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true,
};

app.use(cors(corsOptions));

// Responde a todas as requisições OPTIONS
app.options('*', cors(corsOptions));

app.use(timezoneMiddleware);

app.use("/", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;