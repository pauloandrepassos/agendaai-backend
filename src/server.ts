import http from 'http'
import app from './index'
import AppDataSource from './database/config'

const PORT = process.env.PORT || 3001

const server = http.createServer(app)

AppDataSource.initialize()
    .then(async () => {
        console.log('Database OK');

        server.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`)
        })
    })
    .catch((error) => console.log("Erro ao inicializar o Data Source:", error));
