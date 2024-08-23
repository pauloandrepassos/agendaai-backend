const express = require("express")
const { verificarToken, verificarTokenAdmin } = require("../middleware/authMiddleware")
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

router.get('/users/count', verificarTokenAdmin, async (req, res) => {
    try {
        const quantidadeUsuarios = await userService.contarUsuarios()
        res.status(200).json({ quantidade: quantidadeUsuarios })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao contar usuários.' })
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

router.put('/user/alterar-foto', verificarToken(), async (req, res) => {
    try {
        const idUsuario = req.userId
        const { imagem } = req.body

        if (!imagem) {
            return res.status(400).json({ error: 'Imagem é obrigatória.' })
        }

        const userAtualizado = await userService.atualizarImagem(idUsuario, imagem)

        if (!userAtualizado) {
            return res.status(404).json({ error: 'Usuário não encontrado.' })
        }

        res.status(200).json({ message: 'Imagem atualizada com sucesso.', user: userAtualizado })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar a imagem do usuário.' })
    }
})

module.exports = router