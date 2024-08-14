const express = require('express')
const router = express.Router()
const PedidoService = require('../services/pedidoService')
const { verificarToken, verificarTokenGerente, verificarTokenCliente } = require('../middleware/authMiddleware')
const pedidoService = new PedidoService()

// Rota para criar um novo pedido
router.post('/pedido', verificarToken('cliente'), async (req, res) => {
    try {
        const idUsuario = req.userId
        const { idLanchonete, lanches } = req.body
        console.log(lanches)
        const pedido = await pedidoService.cadastrarPedido(idUsuario, idLanchonete, lanches)
        res.status(201).json(pedido)
    } catch (error) {
        res.status(500).json({ error: `Erro ao criar o pedido.${error}` })
    }
})

// Rota para listar todos os pedidos de um usuário
router.get('/pedidos', verificarTokenCliente, async (req, res) => {
    try {
        const idUsuario = req.userId
        const pedidos = await pedidoService.listarPedidosUsuario(idUsuario)
        res.status(200).json(pedidos)
    } catch (error) {
        res.status(500).json({ error: `Erro ao listar os pedidos do usuário ${error}` })
    }
})

// Rota para listar todos os pedidos de uma lanchonete
router.get('/lanchonete-pedidos', verificarTokenGerente, async (req, res) => {
    console.log('lanchonete-pedidos-aqui')
    try {
        const idLanchonete = req.lanchoneteId
        const pedidos = await pedidoService.listarPedidosLanchonete(idLanchonete)
        res.status(200).json(pedidos)
    } catch (error) {
        res.status(500).json({ error: `Erro ao listar os pedidos da lanchonete. ${error}` })
    }
})

// Rota para atualizar o status de um pedido
router.patch('/pedido/:id/status', async (req, res) => {
    try {
        const idPedido = req.params.id
        const { status } = req.body
        const pedidoAtualizado = await pedidoService.atualizarStatusPedido(idPedido, status)
        res.status(200).json(pedidoAtualizado)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o status do pedido.' })
    }
})

module.exports = router
