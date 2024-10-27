import { Router } from "express";
import userController from "../controllers/userController.js";
import {body,param,query,validationResult} from  "express-validator";
import validarErrores from "../middleware/validarErrores.js";


const router= Router();



router.get('/',userController.getUsers)


router.get('/name',
    query('name').notEmpty().withMessage('El nombre es obligatorio'),
    userController.getUserByName)

    
 // Ruta para obtener la sesión activa
  router.get('/session', userController.getSession);


router.get('/:id',
    param('id').isInt().withMessage('El ID debe ser un numero entero'),
    validarErrores, //midleware para manerjar errores
    userController.getUserById)



router.post('/add',
    [body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email no es valido'),
    body('password').isLength({min:7}).withMessage('La contraseña debe tener al menos 7 caracteres')],
    userController.addUser)

router.delete('/:id',
[param('id').isInt().withMessage('El ID debe ser un número entero')],
userController.deleteUser)

router.put('/:id',
    [
        param('id').isInt().withMessage('El ID debe ser un número entero'),
        body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
        body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
        body('email').optional().isEmail().withMessage('Correo no válido'),
    ]
    ,userController.updateUser)

// Login usando el metodo de autneticacion de supabase
    router.post('/loginSupabase',[

        body('email').isEmail().withMessage('El correo no es valido'),
        body('password').isLength({min:7}).withMessage('La contraseña debe tener al menos 7 caracteres')
    ],
        
        
        userController.loginSupabase)


    router.post('/logoutSupabase',userController.logoutSupabase)


    //Logins normal usando los datos en la base de datos en supabase
    router.post('/login',[

        body('email').isEmail().withMessage('El correo no es valido'),
        body('password').isLength({min:7}).withMessage('La contraseña debe tener al menos 7 caracteres')
    ],
    userController.login)


    router.get('/dni',  
        query('name').notEmpty().withMessage('El nombre es obligatorio'),
        userController.getUserByCedula)


export default router;