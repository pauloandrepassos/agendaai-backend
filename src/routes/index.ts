import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import imageRouter from "./imageUpload";

const router = Router()

router.use('/', userRouter)
router.use('/', authRouter)
router.use('/', imageRouter)

export default router