import User from "../models/userModel.js";
import redis from '../config/redisClient.js';
import {hash,genSalt,compare} from 'bcrypt';
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid';
import uploadImageSupabase from '../middleware/uploadSupabase.js'
import notificationService from "../services/notificationService.js";
import handleError from "../utils/handleError.js";
import hashPassword from "../utils/hashPassword.js";
import cacheService from "../services/cacheService.js";


class userController {


static getUsers = async (req,res)=>{
 try {
 const cachedUsers = await cacheService.getFromCache('users')
 //const cachedUsers= await redis.get('users')
  if (cachedUsers) {
   console.log('Usarios obtenidos mediante redis')
notificationService.notify('Hola victor')
 return  res.json(cachedUsers)
  }


    const result= await User.getUsers();
console.log('usuarios obtenidos por supabase')

//await redis.set('users',JSON.stringify(result),'EX',600)

await cacheService.setToCache('users',result)

    res.status(200).json(result) 
 } catch (error) {
   handleError(res,error)    
    
 }


}



//-----------------------------------------------------------------------------------------

static getUserById = async (req,res)=>{
   
   const {id} = req.params
console.log('victor',id)
  const errors= validationResult(req)
  if (!errors.isEmpty()) {
   return res.status(400).json({errors:errors.array()})
   
  }
   try {

      const cachedUser = await cacheService.getFromCache(`user:${id}`);

     // const cachedUser= await redis.get(`user:${id}`);

     if(cachedUser){
      console.log('Usuario obtenido mediante redis')
      return res.status(200).json(cachedUser)
     } 


     //Si no hay cache se obtienen lo datos de supabase
      const  result = await User.getUserById(id);
      console.log('usuarios obtenidos por supabase',result)
      

      if (!result) {
         return res.status(404).json({ message: 'Usuario no encontrado' });
       }

      // await redis.set(`user:${id}`,JSON.stringify(result),'EX',600);

      await cacheService.setToCache(`user:${id}`, result);


      res.status(200).json(result)

      
   } catch (error) {
      handleError(res,error)    

   }
}

//-------------------------------------------------------------------------------------


static getUserByName= async(req,res)=>{
   const {name} =  req.params
   try {

   // const cachedUser = await redis.get(`user:name${name}`);
   const cachedUser = await cacheService.getFromCache(`user:name:${name}`);


    if(cachedUser){
      console.log(`Usuario ${name} obtenido del cache`);
      return res.json(JSON.parse(cachedUser))
    }

      const result = await User.getUserByName(name);


    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
      console.log(`Dato obtenido de redis`)

     // await redis.set(`user:name:${name}`,JSON.stringify(result),'EX',600)
     await cacheService.setToCache(`user:name:${name}`, result);

     console.log(`Usuario ${name} guardado en cache`)


     return res.json(result) 

      } catch (error) {
         handleError(res,error)    

         }

}


//-----------------------------------------------------------------------------------------------------------

static  addUser = async  (req, res) => {

const {name, apellido, cedula, email , password}= req.body

const errors = validationResult(req);
if(!errors.isEmpty()){
 return res.status(400).json({error:errors.array()})
}


try {

   const existingUser= await User.checkCedulaExists(cedula)

if(existingUser){
   return res.status(400).json({ error: 'El usuario ya existe' });
}

   const hashedpassword=  await hashPassword(password)


   const result= await User.addUser(name,apellido,cedula,email,hashedpassword)

   if(!result){
      return res.status(400).json({message:'Error al agregar usuario'})
   }

    // Eliminar el caché global de usuarios para que se recargue con la lista actualizada.
   // await redis.del('users');
   await cacheService.deleteFromCache('users');



   return res.status(201).json('usuario creado exitosamente')
   
} catch (error) {
   handleError(res,error)    
   

   
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

     // Eliminar el caché global y el específico del usuario eliminado.
    // await redis.del(`user:${id}`);
    // await redis.del('users');
    await cacheService.deleteFromCache(`user:${id}`);
    await cacheService.deleteFromCache('users');

 

   res.status(200).json({ message: 'Usuario eliminado exitosamente' });
} catch (error) {
   handleError(res,error)    

}


}

//--------------------------------------------------------------------------------
static updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, apellido, cedula, email } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingUser = await User.checkCedulaExists(cedula);
    if (existingUser && existingUser.id !== id) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const updateFields = {};
    if (name) updateFields.nombre = name;
    if (apellido) updateFields.apellido = apellido;
    if (cedula) updateFields.cedula = cedula;
    if (email) updateFields.email = email;

    const result = await User.updateUser(id, updateFields);
    if (!result) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

   // await redis.del(`user:${id}`);
   // await redis.del('users');
   await cacheService.deleteFromCache(`user:${id}`);
   await cacheService.deleteFromCache('users');


    res.status(200).json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
   handleError(res,error)    

  }
}



//----------------------------------------------------------------
 static getUserByCedula= async (req,res)=>{
   const {cedula}= req.query

   
  const errors= validationResult(req)
  if (!errors.isEmpty()) {
   return res.status(400).json({errors:errors.array()})
   
  }

  try {

    const cacheKey = `user:cedula:${cedula}`

 let user = await cacheService.getFromCache(cacheKey)
 console.log('datos obtenidos desde redis')

   if(!user){

       user= await User.getUserByCedula(cedula)

       if (!user) {
         return res.status(404).json({ message: 'Usuario no encontrado' });
     }    
     await cacheService.setToCache(cacheKey, user);   
   }
   res.status(200).json(user)
   
  } catch (error) {
   handleError(res,error)    


  }

 }


 //----------------------------------------------------------------------

 static getLoginHistory= async  (req,res)=>{
   const {id}= req.params
   const errors= validationResult(req)
   if (!errors.isEmpty()) {
      return res.status(400).json({errors:errors.array()})
      }

      try {

         const loginHistory= await User.getLoginHistory(id)

         const meta={
            Numeroingresos:  loginHistory.length,
            Ultimoingreso: loginHistory[loginHistory.length-1].fecha,
            historial: loginHistory

         }

         if(!loginHistory){
            return res.status(404).json({ message: 'Historial de login no encontrado' });
         }

         res.status(200).json(meta)

         
      } catch (error) {
         handleError(res,error)    


      }


}

//-----------------------------------------------------------------------------------------------
 static getUsersWithPagination = async (req,res)=>{
   const{ page=1,limit=10}= req.query
   const offset= (page-1) * limit;

   try {
      const users = await User.getUsersWithPagination(limit, offset);
      res.status(200).json(users)

      
   } catch (error) {
      handleError(res,error)    

      
   }
 }



//-------------------------------------------------------------------------------------------

static searchUsers= async  (req,res)=>{
   const {name,apellido,cedula, email}= req.query
   try {


      const fields={}

       // Preparar los campos a actualizar
    if (name) fields.nombre = name;
    if (apellido) fields.apellido = apellido;
    if (cedula) fields.cedula = cedula;
    if (email) fields.email = email;

    // Crea una clave única para la consulta
    const cacheKey = JSON.stringify(fields);

    // Intenta obtener los datos de Redis
    const cachedUsers = await redis.get(cacheKey);
    if (cachedUsers) {
        // Si hay datos en caché, devuélvelos
        console.log('Usuario obtenido mediante redis')

        return res.status(200).json(JSON.parse(cachedUsers));
    }

      const users = await User.searchUsers(fields);

      if (users.length===0) {
         return res.status(404).json({ message: 'No se encontraron usuarios' });
         
      }

     // Almacena los resultados en Redis por un tiempo determinado (ej. 1 hora)
     await redis.set(cacheKey, JSON.stringify(users), 'EX', 3600);

      res.status(200).json(users)

   }catch(error){
      handleError(res,error)    

   }


}

//---------------------------------------------------------------------------------------------------------------------


static addMultipleUsers = async (req, res) => {
    // Validar los resultados de la validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

   console.log('full body',req.body)
   // Convierte users de string a objeto
   let users;
   if (typeof req.body.users === 'string') {
      // Convierte users de string a objeto si viene de form-data
      try {
          users = JSON.parse(req.body.users || '[]');
      } catch (error) {
          return res.status(400).json({ error: 'Invalid JSON format for users' });
      }
  } else {
      // Si ya es un array (JSON puro)
      users = req.body.users || [];
  }

  //const imagePath = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;

   console.log(users);

   if (!Array.isArray(users)) {
       return res.status(400).json({ error: 'Users must be an array' });
   }

   const errorsList = [];
   const createdUsers = [];
   const usersToInsert = [];
   try {
       

       for (const user of users) {
           const { name, apellido, cedula, email, password } = user;

           if (!name || !apellido || !email || !password) {
               errorsList.push({ error: 'Nombre, apellido, correo y contraseña son requeridos', user });
               continue; // Cambiado para seguir insertando otros usuarios
           }


           const existingUser = await User.checkCedulaExists(cedula);

           if (existingUser) {
               errorsList.push({ error: 'El usuario ya existe', name });
               continue; // Cambiado para seguir insertando otros usuarios
           }



              
              const imageFile=  req.files[0];
              console.log(imageFile)
              const imagePath= await uploadImageSupabase(imageFile)

console.log(imagePath)

           const uuid= uuidv4();


           const hashedPassword = await hash(password, 10);

           usersToInsert.push({
               uuid,
               nombre:name,
               apellido,
               cedula,
               email,
              contraseña: hashedPassword,
              imagen:imagePath
               
           });
       }


       

       if (usersToInsert.length > 0) {
           // Llama a la función de inserción de múltiples usuarios en el modelo
           const result = await User.addMultipleUsers(usersToInsert);
           createdUsers.push(...usersToInsert.map(user => ({ name: user.nombre }))); // Solo agregar nombres
       }


        // Eliminar datos existentes en Redis antes de insertar nuevos
        await redis.del('users'); // Eliminar clave existente

       if (errorsList.length > 0) {
           res.status(400).json({ errorsList });
       } else {
           res.status(201).json({ createdUsers });
       }

   } catch (error) {
      handleError(res,error)    

   }
}

//-------------------------------------------------------------------------------------------------------
// Función para obtener todos los usuarios

 static deleteMultipleUsers= async (req,res)=>{
   const {users}= req.body

  if (!Array.isArray(users)) {
   return res.status(400).json({error:'user debe ser un arreglo'})
   }

   try {
      const deletePromises = users.map(user=>{
         const {id}= user
         return User.deleteUser(id)


      })

      await  Promise.all(deletePromises)

       // Opcional: Eliminar datos de usuarios en Redis
       await redis.del('users'); // Eliminar la clave de usuarios

       const remainingUsers = await User.getUsers(); // Suponiendo que tienes una función para obtener todos los usuarios
       await redis.setEx('users', 3600, JSON.stringify(remainingUsers));

      res.status(200).json({message:'Usuarios eliminados exitosamente'})
   } catch (error) {
      handleError(res,error)    

      
   }

 }


}


export default userController