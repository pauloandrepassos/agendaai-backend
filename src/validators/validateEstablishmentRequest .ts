import { check, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'

const validateEstablishmentRequestFields = [
    check('name')
        .notEmpty().withMessage('Nome do estabelecimento é obrigatório')
        .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),

    check('logo')
        .notEmpty().withMessage('Logo é obrigatório')
        .isURL().withMessage('Logo deve ser uma URL válida'),

    check('background_image')
        .notEmpty().withMessage('Imagem de fundo é obrigatória')
        .isURL().withMessage('Imagem de fundo deve ser uma URL válida'),

    check('cnpj')
        .notEmpty().withMessage('CNPJ é obrigatório')
        .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).withMessage('Formato de CNPJ inválido. Exemplo: 00.000.000/0000-00'),

    check('zip_code')
        .notEmpty().withMessage('CEP é obrigatório')
        .matches(/^\d{5}-\d{3}$/).withMessage('Formato de CEP inválido. Exemplo: 00000-000'),

    check('state')
        .notEmpty().withMessage('Estado é obrigatório')
        .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),

    check('city')
        .notEmpty().withMessage('Cidade é obrigatória'),

    check('neighborhood')
        .notEmpty().withMessage('Bairro é obrigatório'),

    check('street')
        .notEmpty().withMessage('Rua é obrigatória'),

    check('number')
        .notEmpty().withMessage('Número é obrigatório'),

    check('complement')
        .optional()
        .isString().withMessage('Complemento deve ser uma string'),

    check('reference_point')
        .optional()
        .isString().withMessage('Complemento deve ser uma string'),

    check('vendor_id')
        .notEmpty().withMessage('ID do vendedor é obrigatório')
        .isInt().withMessage('ID do vendedor deve ser um número inteiro'),
]

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ message: "Erro de validação dos campos", errors: errors.array() })
        return
    }
    next()
}

export const validateEstablishmentRequest = [...validateEstablishmentRequestFields, handleValidationErrors]
