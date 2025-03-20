import express from 'express';
import router from './routes';
import cors from 'cors';
import timezoneMiddleware from './middlewares/timezone';
import swaggerDocument from './swagger.json';
import swaggerUi from 'swagger-ui-express';

const app = express();

// Configuração do CORS
const corsOptions = {
    origin: ['https://agendaai.vercel.app', 'http://localhost:3000', 'https://agendeaii.com.br'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true,
};

// Aplica o CORS com as opções configuradas
app.use(cors(corsOptions));

// Middleware para responder a requisições OPTIONS (pré-flight)
app.options('*', cors(corsOptions));

// Middleware para adicionar manualmente os cabeçalhos CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://agendeaii.com.br');
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');
    next();
});

// Configuração para aumentar o limite de tamanho de upload
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware para ajustar o fuso horário
app.use(timezoneMiddleware);

// Rotas da aplicação
app.use("/", router);

// Configuração do Swagger para documentação da API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;