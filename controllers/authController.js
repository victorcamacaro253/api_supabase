import authModel from '../models/authModel.js';
import supabase from '../config/supabaseClient.js';
import userModel from '../models/userModel.js';
import {hash,compare} from 'bcrypt';
import tokenService from '../services/tokenService.js';
import {randomBytes} from 'crypto';


class authController {

    static googleLogin = async (req, res) => {
        try {
            const authData = await authModel.signInWithGoogle()
            res.status(200).json({
                message: "User logged in successfully",
                data: authData.url
            })
        }catch(error){
            res.status(500).json({
                message: 'Error al iniciar sesión con Google',
                error: error.message,
            });
        }
}
//recordar que el access token refresh token,toke provider lo da la url cuando la autenticacion existosa

static handleCallback = async (req, res) => {
    try {
// Obtén el token del header Authorization
const access_token = req.headers.authorization?.split(' ')[1];
        if (!access_token) {
            return res.status(400).json({ message: 'Token no proporcionado' });
        }
//console.log('token',access_token)
        // Validar el token y obtener datos del usuario
        const { data: user, error } = await supabase.auth.getUser(access_token);
       // console.log('user',user)
        if (error) {
            throw new Error(error.message);
        }

        const { email } = user.user;

        const verifyExists = await userModel.findByEmail(email)
        if (verifyExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
            }

         // Guardar usuario en la base de datos
         const savedUser = await authModel.saveUserToDatabase(user);

        // Opcional: Guardar usuario en la base de datos
        // saveUserToDatabase(user);

        return res.status(200).json({
            message: 'Autenticación completada con éxito',
            user,
            tokens: { access_token, refresh_token, expires_at },
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error en la autenticación', error: error.message });
    }
        

}

static login =async(req,res)=>{
    const {email,password}= req.body
 
    try {
 
       const user= await userModel.findByEmail(email)
       console.log(user.contraseña)
 
       if(!user){
          return res.status(404).json({ message: 'Usuario no encontrado' });
       }
 
       const match= await compare(password,user.contraseña)
 
       if (!match) {
          return res.status(401).json({ message: 'Credenciales inválidas'})
          
       }
 
       const token = tokenService.generateToken(user.id,user.email)
 
       const code= randomBytes(8).toString('hex')
 
    await userModel.insertLoginRecord(user.id,code)
 
    res.status(200).json({
       message:'inicio de sesion existoso',
       token:token,
    })
       
    } catch (error) {
       console.log(error)
       return res.status(500).json({message: error.message})
       
    }
 
     
 }
 
 
//--------------------------------------------------------------------------


static loginSupabase= async  (req, res) => {
    const  { email, password } = req.body;
   
    try {
   
      const result= await User.loginSupabase(email,password)
   
      if (result) {
         res.status(200).json({ message: 'Inicio de sesión exitoso', session: result });
   
      }
      
    } catch (error) {
      console.log(error)
      return   res.status(500).json({ message: error.message });
   
      
    }
    }
   
    //---------------------------------------------------------------------------------------
   
    static logoutSupabase = async (req, res) => {
      try {
          const { error } = await supabase.auth.signOut();
   
          if (error) {
              return res.status(400).json({ message: 'Error al cerrar sesión', error });
          }
   
          return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
      } catch (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error interno del servidor', error: err.message });
      }
   };
   
    //---------------------------------------------------------------------------------------
   
    static getSession = async (req,res)=>{
      try {
         const { data, error } = await supabase.auth.getSession();
         if (error || !data.session) {
           return res.status(401).json({ message: 'Sesión no válida o expirada' });
         }
   
      } catch (error) { 
         console.log(error)
         return res.status(500).json({ message: error.message });
         
      }
    }
   
   

}


export default authController