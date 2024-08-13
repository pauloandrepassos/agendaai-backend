const express = require("express")
const { verificarToken } = require("../middleware/authMiddleware")
const router = express.Router()
const UserService = require('../services/userService')
const userService = new UserService()


router.get('/users', verificarToken(), async (req, res) => {
    try {
        const users = await userService.listarUsuarios()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários.' })
    }
})

router.get('/user', verificarToken(), async (req, res) => {
    try {
        const idUsuario = req.userId
        const user = await userService.buscarUsuario(idUsuario)
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' })
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário.' })
    }
})

router.get('/user/:id', verificarToken(), async (req, res) => {
    try {
        const idUsuario = req.params.id
        const user = await userService.buscarUsuario(idUsuario)
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' })
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário.' })
    }
})

module.exports = router