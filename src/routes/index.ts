import { Router } from "express";
import userRouter from "./user";
import establishmentRouter from "./establishment";

const router = Router()

router.use('/', userRouter)
router.use('/',establishmentRouter)

export default router