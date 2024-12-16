import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import establishmentRouter from "./establishment";
import establishmentRequestRouter from "./establishmentRequest";
import operatingHoursRouter from "./operatingHours";
import shoppingBasketRouter from "./shoppingBasket";
import productRouter from "./product";

const router = Router()

router.use('/', userRouter, authRouter, establishmentRequestRouter, establishmentRouter,operatingHoursRouter, productRouter)

export default router