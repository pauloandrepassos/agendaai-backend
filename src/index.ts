import express from 'express';
import router from './routes';
import cors from 'cors';
import timezoneMiddleware from './middlewares/timezone';
import swaggerDocument from './swagger.json'
import swaggerUi from 'swagger-ui-express'

const app = express()

app.use(express.json())

app.use(cors());

app.use(timezoneMiddleware)

app.use("/", router)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default app