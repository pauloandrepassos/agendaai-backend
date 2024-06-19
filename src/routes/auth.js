const express = require('express')
const router = express.Router()

const AuthService = require('../services/authService')
const authService = new AuthService()

const {verificarToken} = require('../middleware/authMiddleware')

router.get('/register', (req, res) => {
    res.send('Ok')
})


router.post('/register', async (req, res) => {
    const { nome, email, password, confirmPassword, papel } = req.body

    //await adicionar função de validação de dados (em próxima versão)

    try {
        const { userTemp, token } = await authService.registerUserTemp(nome, email, password, papel)
        res.status(201).json({ message: "Solicitação enviada com sucesso", userTemp, token })
    } catch (error) {
        res.status(500).json({ error: "Erro ao cadastrar usuário", message: error.message })
    }
})
router.get('/verify', verificarToken(), async (req, res) => {
    const { token, email } = req.query
    try {
        const user = await authService.verifyUserEmail(token, email)
        res.status(200).json({ message: 'Email verificado com sucesso.', user })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/login', async (req, res ) => {
    const {email, password} = req.body
    try {
        const {user, token} = await authService.signIn(email, password)
        res.status(200).json({message: 'Login bem-sucedido',username: user.nome, token})
        
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

router.post('/senha', async (req, res) => {
    const {email, senhaFornecida} = req.body
    try {
        const resultado = await authService.verificarSenha(email, senhaFornecida);
        if (resultado) {
            res.status(200).send('Senha válida');
        } else {
            res.status(401).send('Senha inválida');
        }
    } catch (err) {
        res.status(400).send(err.message);
    }
})

module.exports = router