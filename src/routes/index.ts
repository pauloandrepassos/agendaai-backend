import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";

const router = Router()

router.use('/', userRouter)
router.use('/', authRouter)

export default router