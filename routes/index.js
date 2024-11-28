import { Router } from "express";
import productsRoutes from './productsRoutes.js'
import userRoutes from './userRoutes.js'
import comprasRoutes from './comprasRoutes.js'
import authRoutes from './authRoutes.js'

const router = Router()

router.use('/users',userRoutes)

router.use('/products',productsRoutes)

router.use('/compras',comprasRoutes)

router.use('/auth',authRoutes)

export default router