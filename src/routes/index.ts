import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import imageRouter from "./imageUpload";
import establishmentRequestRouter from './establishmentRequest'

const router = Router()

router.use('/', userRouter)
router.use('/', authRouter)
router.use('/', imageRouter)
router.use('/', establishmentRequestRouter)

export default router