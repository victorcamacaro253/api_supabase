import User from "../models/userModel.js";
import redis from '../config/redisClient.js';
import {hash,genSalt,compare} from 'bcrypt';

class userController {


static getUsers = async (req,res)=>{
 try {
 
   const cachedUsers= await redis.get('users')
  if (cachedUsers) {
   console.log('Usarios  obtenidos mediante redis')

 return  res.json(JSON.parse(cachedUsers))
  }


    const result= await User.getUsers();
console.log('usuarios obtenidos por supabase')

await redis.set('users',JSON.stringify(result),'EX',600)



    res.json(result)
 } catch (error) {
    res.status(500).json({ message: error.message });
    
 }


}

//-----------------------------------------------------------------------------------------

static getUserById = async (req,res)=>{
   const {id} = req.params
   try {

      const cachedUser= await redis.get(`user:${id}`);

     if(cachedUser){
      console.log('Usuario obtenido mediante redis')
      return res.status(200).json(JSON.parse(cachedUser))
     } 

     //Si no hay cache se obtienen lo datos de supabase
      const  result = await User.getUserById(id);
      console.log('usuarios obtenidos por supabase')
      

      if (!result) {
         return res.status(404).json({ message: 'Usuario no encontrado' });
       }

       await redis.set(`user:${id}`,JSON.stringify(result),'EX',600);

      res.status(200).json(result)

      
   } catch (error) {
      res.status(500).json({ message: error.message });
      console.log(error)
   }
}

//-------------------------------------------------------------------------------------


static getUserByName= async(req,res)=>{
   const {name} =  req.query
   try {

    const cachedUser = await redis.get(`user:name${name}`);

    if(cachedUser){
      console.log(`Usuario ${name} obtenido del cache`);
      return res.json(JSON.parse(cachedUser))
    }

      const result = await User.getUserByName(name);


    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
      console.log(`Dato obtenido de redis`)

      await redis.set(`user:name:${name}`,JSON.stringify(result),'EX',600)
     console.log(`Usuario ${name} guardado en cache`)


     return res.json(result) 
      } catch (error) {
         res.status(500).json({ message: error.message });

         console.log(error)
         }

}


//-----------------------------------------------------------------------------------------------------------

static  addUser = async  (req, res) => {

const {name, apellido, cedula, correo , contraseña}= req.body



try {

   if (!name || !apellido || !correo || !contraseña) {
      return res.status(400).json({ error: 'Nombre, apellido, correo y contraseña son requeridos' });
   }
   
   if (contraseña.length < 7) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 7 caracteres' });
   }
   

   const existingUser= await User.checkCedulaExists(cedula)

if(existingUser){
   return res.status(400).json({ error: 'El usuario ya existe' });
}

   const salt= await genSalt(10);
   const hashedPassword=  await hash(contraseña,salt)


   const result= await User.addUser(name,apellido,cedula,correo,hashedPassword)

   if(!result){
      return res.status(400).json({message:'Error al agregar usuario'})
   }
   return res.status(201).json(result)
   
} catch (error) {
   console.log(error)
   res.status(500).json({ message: error.message });

   
}


}


//---------------------------------------------------------------------------------------------

static deleteUser  = async (req, res) => {
 const {id}= req.params

 
 try {
   const result = await User.deleteUser(id);

   if (result.affectedRows === 0) {
       return res.status(404).json({ error: 'Usuario no encontrado' });
   }

   res.status(200).json({ message: 'Usuario eliminado exitosamente' });
} catch (err) {
   console.error('Error ejecutando la consulta:', err);
   res.status(500).json({ error: 'Error interno del servidor' });
}


}



}

export default userController