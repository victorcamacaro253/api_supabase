import { Router } from "express";
import comprasController from "../controllers/comprasController.js";

const router = Router()

//Ruta para obtener las compras 
router.get('/',comprasController.getCompras)

//Ruta para obtener una compra por id
router.get('/:id',comprasController.getCompraById)

//Ruta para agrear una compra
router.post('/',comprasController.compraProduct)

export default router