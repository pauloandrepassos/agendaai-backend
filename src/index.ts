import express from 'express';
import router from './routes';
import cors from 'cors';
import timezoneMiddleware from './middlewares/timezone';
import swaggerDocument from './swagger.json';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Define a URL permitida para o CORS, buscando do .env ou usando um valor padrão
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://agendeaii.com.br';

// Configuração do CORS
const corsOptions = {
    origin: ['https://agendeaii.com.br', 'https://agendaai.vercel.app', 'http://localhost:3000'], // Adicione outras origens permitidas
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
    res.header('Access-Control-Allow-Origin', allowedOrigin);
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