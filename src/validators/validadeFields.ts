import { check, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'

const validateRegisterFields = [
    check('name')
        .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),

    check('cpf')
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('Formato de CPF inválido. Example: 000.000.000-00'),

    check('email')
        .isEmail().withMessage('Email inválido'),

    check('password')
        .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),

    check('phone')
        .notEmpty().withMessage('Número de telefone é obrigatório'),
]

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ message: "Erro de validação dos campos", errors: errors.array() })
        return
    }
    next()
}

export const validateRegister = [...validateRegisterFields, handleValidationErrors]
