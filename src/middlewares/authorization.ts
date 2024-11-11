import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'


interface AuthenticatedRequest extends Request {
    userId?: number
    userType?: string
}

const verifyToken = (requiredType?: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        console.log('Chegou no middleware verifyToken(type)')

        const token = req.headers['token'] as string

        if (!token) {
            res.status(401).json({ error: 'Token não fornecido.' })
            return
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as { id: number, type: string}
            req.userId = decoded.id
            req.userType = decoded.type

            if (requiredType && decoded.type !== requiredType) {
                res.status(403).json({ error: 'Acesso negado.' })
                return
            }

            next()
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({ error: 'Acesso expirado.' })
            } else if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ error: 'Acesso inválido.' })
            } else {
                res.status(401).json({ error: 'Erro na verificação do token.' })
            }
        }
    }
}

export default verifyToken
