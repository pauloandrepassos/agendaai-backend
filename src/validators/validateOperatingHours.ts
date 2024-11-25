import { Request, Response, NextFunction } from "express"

export const validateOperatingHours = (req: Request, res: Response, next: NextFunction) => {
    const { open_time, close_time } = req.body

    const openTime = new Date(`1970-01-01T${open_time}Z`)
    const closeTime = new Date(`1970-01-01T${close_time}Z`)

    if (closeTime <= openTime) {
        res.status(400).json({
            message: "O horário de fechamento deve ser maior que o horário de abertura.",
        })
        return
    }

    next()
}
