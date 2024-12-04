import { Router } from "express";
import comprasController from "../controllers/comprasController.js";
import {body,check,param,query,validationResult} from  "express-validator";


const router = Router()

//Ruta para obtener las compras 
router.get('/',comprasController.getCompras)

//Ruta para obtener las compras de un usuario por su nombre
router.get('/comprasUser/',comprasController.getComprasCountByUsuario)

//Ruta para obtener las compras de un usuario por su id
router.get('/user/:id',
    param('id').isInt().withMessage('El ID debe ser un numero entero'),
comprasController.getComprasByUserId)


//Ruta para obtener una compra por id
router.get('/:id',
param('id').isInt().withMessage('El ID debe ser un numero entero'),
comprasController.getCompraById)

//Ruta para agrear una compra
router.post('/',
    [
        body('id_usuario').isInt().withMessage('El id del usuario debe ser un numero entero'),
        body('productos').isArray().withMessage('Los productos deben ser un array').notEmpty().withMessage('Se requiere al menos un producto'),
        body('productos.*.id_producto').isInt().withMessage('El id producto debe ser un numero entero'),
        body('productos.*.cantidad').isInt({gt:0}).withMessage('La cantidad debe ser un numero entero mayor a 0'),
        body('productos.*.precio').isFloat({gt:0}).withMessage('El precio debe ser un numero mayor a 0')
    ]
    ,comprasController.compraProduct)


    router.delete('/:id',
        param('id').isInt().withMessage('El id de la compra debe ser un numero entero')
        ,comprasController.deleteCompra)



export default router