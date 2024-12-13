import { Router } from "express";
import userController from "../controllers/userController.js";
import {body,check,param,query,validationResult} from    "express-validator";
import validarErrores from "../middleware/validarErrores.js";
import upload from "../middleware/multerConfig.js";

const router= Router();



router.get('/',userController.getUsers)




  router.get('/dni',  
    query('cedula').notEmpty().withMessage('La cedula es obligatorio'),
    userController.getUserByCedula)

    
  router.get('/page',userController.getUsersWithPagination)

 
//Ruta para obtener los usuarios filtrados
router.get('/searchUser',[  
    query('name').optional().notEmpty().withMessage('El nombre es obligatorio'),
    query('apellido').optional().notEmpty().withMessage('El apellido es obligatorio'),
    query('cedula').optional().notEmpty().withMessage('La cedula es obligatorio'),
    query('email').isEmail().withMessage('El email es obligatorio'),
    
],userController.searchUsers);




router.get('/loginHistory/:id',
  [
    param('id').isInt().withMessage('El id tiene que ser un numero entero'),
    validarErrores, //midleware para manerjar errores
  ],
  userController.getLoginHistory
)

        
  router.get('/:id',
    param('id').isInt().withMessage('El ID debe ser un numero entero'),
    validarErrores, //midleware para manerjar errores
    userController.getUserById)


        router.get('/name/:name',
            param('name').notEmpty().withMessage('El nombre es obligatorio'),
            userController.getUserByName)
        



router.post('/',
    [body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email no es valido'),
    body('password').isLength({min:7}).withMessage('La contraseña debe tener al menos 7 caracteres')],
    userController.addUser)

router.delete('/:id',
[param('id').isInt().withMessage('El ID debe ser un número entero')],
userController.deleteUser)


//Ruta para cambiar el estado del usuario
router.put('/status/:id/:status',userController.changeStatus)

router.put('/:id',
    [
        param('id').isInt().withMessage('El ID debe ser un número entero'),
        body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
        body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
        body('email').optional().isEmail().withMessage('Correo no válido'),
    ]
    ,userController.updateUser)






    router.post('/addMultipleUsers',
        [
            check('users').isArray().optional().withMessage('Users must be an array'),
            check('users.*.name').notEmpty().withMessage('Name  es requerido'),
            check('users.*.apellido').notEmpty().withMessage('Apellido es requerido'),
            check('users.*.cedula').notEmpty().withMessage('Cedula es requerido'),
            check('users.*.email').isEmail().withMessage('Invalido formato de email'),
            check('users.*.password').isLength({ min:7 }).withMessage('Password debe ser al menos 7  caracteres')

        ]
        ,upload.array('image'),userController.addMultipleUsers)

    router.post('/delete',[
      
        body('ids').isArray().withMessage('Ids deb ser un array')
        .custom((ids)=>{
            ids.forEach(id => {
                if(!Number.isInteger(id)){
                    throw new Error(`El ID es ${id} no es un numero entero valido`)
                }
            });

            return true;
        })

    ],
    validarErrores,
    userController.deleteMultipleUsers)
  


export default router;