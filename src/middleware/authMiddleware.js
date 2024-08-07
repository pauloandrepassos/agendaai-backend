const jwt = require('jsonwebtoken')

function verificarToken(papel) {
    return function(req, res, next) {
        const token = req.query.token || req.headers['token'];
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            if(papel && decoded.papel != papel) {
                return res.status(401).json({ error: 'Acesso negado'})
            }

            req.userId = decoded.id
            next()
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expirado.' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Token inválido.' });
            } else {
                return res.status(401).json({ error: 'Erro na verificação do token.' });
            }
        }
    }
}

module.exports = {
    verificarToken
}