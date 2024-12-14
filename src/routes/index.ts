import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import establishmentRouter from "./establishment";
import establishmentRequestRouter from "./establishmentRequest";
import shoppingBasketRouter from "./shoppingBasket";
import productRouter from "./product";

const router = Router()

router.use('/', userRouter, authRouter, establishmentRequestRouter, establishmentRouter,
shoppingBasketRouter,productRouter)

export default router