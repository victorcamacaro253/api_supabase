import { Router } from "express";
import productsRoutes from './productsRoutes.js'
import userRoutes from './userRoutes.js'
import comprasRoutes from './comprasRoutes.js'
import authRoutes from './authRoutes.js'
import exportRoutes from './exportRoutes.js'

const router = Router()

router.use('/v1/users',userRoutes)

router.use('/v1/products',productsRoutes)

router.use('/v1/compras',comprasRoutes)

router.use('/v1/auth',authRoutes)

router.use('/v1/export',exportRoutes)

export default router