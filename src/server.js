const app = require('./index')
const http = require('http')
const WebSocket = require('ws')
const jwt = require('jsonwebtoken') // Supondo que você esteja usando JWT para autenticação

const PORT = 3001

// Crie o servidor HTTP a partir do aplicativo Express
const server = http.createServer(app)

// Configuração do WebSocket Server
const wss = new WebSocket.Server({ server })

// Armazenar conexões WebSocket por ID de usuário
const clients = new Map()

wss.on('connection', (ws, req) => {
    // Aqui, você deve recuperar o token de autenticação enviado na conexão WebSocket
    const token = req.url.split('token=')[1] // Exemplo de como extrair o token da URL

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY) // Verifica e decodifica o token
            const userId = decoded.id // Supondo que o ID do usuário esteja no token

            // Associa a conexão WebSocket ao ID do usuário
            clients.set(userId, ws)

            console.log(`Cliente ${userId} conectado via WebSocket`)

            ws.on('message', (message) => {
                console.log(`Mensagem recebida de ${userId}:`, message)
            })

            ws.on('close', () => {
                console.log(`Cliente ${userId} desconectado`)
                clients.delete(userId) // Remove a conexão quando o cliente se desconecta
            })
        } catch (error) {
            console.log('WS Erro ao verificar o token:', error)
            ws.close() // Fecha a conexão se o token for inválido
        }
    } else {
        ws.close() // Fecha a conexão se o token não for fornecido
    }
})

// Função para notificar um cliente específico
const notifyClient = (userId, message) => {
    const client = clients.get(userId)
    console.log(`cliente: ${client}`)
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
    }
}

// Torne a função disponível globalmente para as rotas
app.set('notifyClient', notifyClient)

server.listen(PORT, () => {
    console.log(`App rodando na porta ${PORT}`)
})
