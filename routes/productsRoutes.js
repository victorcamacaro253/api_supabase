import { Router } from "express";
import productsController from "../controllers/productsController.js";
import {body,check,param,query,validationResult} from  "express-validator";
import upload from "../middleware/multerConfig.js";


const router= Router();

router.get('/',productsController.getProducts)

router.get('/name',
    query('name').notEmpty().withMessage('El producto es obligatorio'),
    productsController.getProductByName)

    

     //Ruta para obtener los productos por un rango de precio
     router.get('/price',
        query('min').isDecimal().optional().withMessage('El precio minimo es requerido'),
        query('max').isDecimal().optional().withMessage('El precio maximo es requerido'),
        productsController.getProductByPriceRange)


 //Ruta para obtener los productos mas vendidos

router.get('/topSelling',productsController.getTopSelling)


router.get('/:id',
          param('id').isInt().withMessage('El ID debe ser un numero entero'),
          productsController.getProductsById)


    
router.post('/', 
    body('id_proveedor').isInt().withMessage('El id_proveedor debe ser un numero entero'),
    body('nombre_producto').notEmpty().withMessage('El producto es obligatorio'),
    body('precio').isFloat().withMessage('El precio debe ser un numero float'),
    body('descripcion').notEmpty().withMessage('La descripción debee teef'),
    body('stock').isInt().withMessage('El stock debe ser un numero entero'),
    body('id_categoria').isInt().withMessage('El id_categoria debe ser un numero entero'),
   // upload.single('imagen'),
     productsController.createProduct)


router.put('/:id',
    [param('id').isInt().withMessage('El ID debe ser un número entero'),
    body('id_proveedor').optional().isInt().withMessage('El id_proveedor debe ser un numero entero'),
    body('nombre_producto').notEmpty().withMessage('El producto es obligatorio'),
    body('precio').optional().isFloat().withMessage('El precio debe ser un numero float'),
    body('descripcion').optional().notEmpty().withMessage('La descripción debee teef'),
    body('stock').optional().isInt().withMessage('El stock debe ser un numero entero'),
    body('id_categoria').optional().isInt().withMessage('El id_categoria debe ser un numero entero')],
    productsController.updateProduct)




router.delete('/:id',
      [param('id').isInt().withMessage('El ID debe ser un número entero')],
     productsController.deleteProduct)



router.post('/addMultipleProducts',
    
    [
        check('products').isArray().optional().withMessage('Products must be an array'),
        check('products.*.nombre_producto').notEmpty().withMessage('Nombre del producto es requerido'),
        check('products.*.descripcion').notEmpty().withMessage('Descripcion del producto es requerido'),
        check('products.*.precio').notEmpty().withMessage('El precio es requerido'),
        check('products.*.stock').notEmpty().withMessage('stock del producto es requerido'),
        check('products.*.id_categoria').notEmpty().withMessage('id de la categoria del producto es requerido'),
        check('products.*.id_proveedor').notEmpty().withMessage('id del proveedor del producto es requerido'),
],
          upload.array('image'),
          productsController.addMultipleProducts)


//Ruta para importar un archivo csv
router.post('/import',upload.single('file'),productsController.importProduct)


export default router;
