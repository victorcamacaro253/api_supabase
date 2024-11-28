import { Router } from "express";
import {body,check,param,query,validationResult} from    "express-validator";
import authController from "../controllers/authController.js";

const router = Router()

router.get('/loginGoogle',authController.googleLogin)


 // Ruta para obtener la sesión activa
 router.get('/session', authController.getSession);

router.post('/google/callback',authController.handleCallback)


//Logins normal usando los datos en la base de datos en supabase
router.post('/login',[

        body('email').isEmail().withMessage('El correo no es valido'),
        body('password').isLength({min:7}).withMessage('La contraseña debe tener al menos 7 caracteres')
    ],
    authController.login)

    
// Login usando el metodo de autneticacion de supabase
router.post('/loginSupabase',[

    body('email').isEmail().withMessage('El correo no es valido'),
    body('password').isLength({min:7}).withMessage('La contraseña debe tener al menos 7 caracteres')
],
authController.loginSupabase)


router.post('/logoutSupabase',authController.logoutSupabase)

export default router;