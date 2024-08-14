const jwt = require('jsonwebtoken');
const LanchoneteModel = require('../models/lanchonete');

function verificarToken(papel) {
    return function(req, res, next) {
        console.log('chegou no middleware verficarToken(papel)')
        const token = req.query.token || req.headers['token'];
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if(papel && decoded.papel !== papel) {
                return res.status(401).json({ error: 'Acesso negado' });
            }

            req.userId = decoded.id;
            req.userPapel = decoded.papel; // Adicionando papel do usuário no request
            next();
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

async function verificarGerenteLanchonete(req, res, next) {
    const lanchoneteId = req.params.id; // ID da lanchonete obtido da rota
    try {
        const lanchonete = await LanchoneteModel.findByPk(lanchoneteId);

        if (!lanchonete) {
            return res.status(404).json({ error: `lanchonete ${lanchoneteId} não encontrada` });
        }

        if (lanchonete.gerente !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado: você não é o gerente desta lanchonete.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar o gerente da lanchonete.' });
    }
}

function verificarTokenAdmin(req, res, next) {
    console.log('chegou no middleware verficarTokenAdmin')
    const token = req.query.token || req.headers['token'];
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        if (decoded.papel !== 'admin') {
            return res.status(401).json({ error: 'Acesso negado' });
        }

        req.userId = decoded.id;
        req.userPapel = decoded.papel;

        next();
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

function verificarTokenCliente(req, res, next) {
    console.log('chegou no middleware verficarTokenCliente')
    const token = req.query.token || req.headers['token'];
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        if (decoded.papel !== 'cliente') {
            return res.status(401).json({ error: 'Acesso negado' });
        }

        req.userId = decoded.id;
        req.userPapel = decoded.papel;

        next();
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

async function verificarTokenGerente(req, res, next) {
    console.log('chegou no middleware verficarTokenGerente')
    const token = req.query.token || req.headers['token'];
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        if (decoded.papel !== 'gerente') {
            return res.status(401).json({ error: 'Acesso negado' });
        }

        req.userId = decoded.id;
        req.userPapel = decoded.papel;

        const lanchonete = await LanchoneteModel.findOne({
            where: { gerente: decoded.id },
            attributes: ['id']
        });

        if (!lanchonete) {
            return res.status(404).json({ error: 'Lanchonete não encontrada para o gerente' });
        }

        req.lanchoneteId = lanchonete.id;

        next();
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

module.exports = {
    verificarToken,
    verificarGerenteLanchonete,
    verificarTokenAdmin,
    verificarTokenCliente,
    verificarTokenGerente
}