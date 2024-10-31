import User from "../models/userModel.js";
import redis from '../config/redisClient.js';
import {hash,genSalt,compare} from 'bcrypt';
import { validationResult } from "express-validator";
import supabase from "../config/supabaseClient.js";
import tokenService from "../services/tokenService.js";
import {randomBytes} from 'crypto';
import { error } from "console";
import { v4 as uuidv4 } from 'uuid';

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

  const errors= validationResult(req)
  if (!errors.isEmpty()) {
   return res.status(400).json({errors:errors.array()})
   
  }
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

   const hashedpassword=  await hash(password, 10)



   const result= await User.addUser(name,apellido,cedula,email,hashedpassword)

   if(!result){
      return res.status(400).json({message:'Error al agregar usuario'})
   }

    // Eliminar el caché global de usuarios para que se recargue con la lista actualizada.
    await redis.del('users');

   return res.status(201).json('usuario creado exitosamente')
   
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

     // Eliminar el caché global y el específico del usuario eliminado.
     await redis.del(`user:${id}`);
     await redis.del('users');
 

   res.status(200).json({ message: 'Usuario eliminado exitosamente' });
} catch (err) {
   console.error('Error ejecutando la consulta:', err);
   res.status(500).json({ error: 'Error interno del servidor' });
}


}

//--------------------------------------------------------------------------------
static updateUser = async (req, res) => {
   const { id } = req.params;
   const { name, apellido, cedula, correo } = req.body;
  
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }


   try {

  const existingUser= await User.checkCedulaExists(cedula)

if(existingUser){
   return res.status(400).json({ error: 'El usuario ya existe' });
}


    const updateFields={}
    // Preparar los campos a actualizar
    if (name) updateFields.nombre = name;
    if (apellido) updateFields.apellido = apellido;
    if (cedula) updateFields.cedula = cedula;
    if (email) updateFields.email = email;


     const result = await User.updateUser(id,updateFields);
    
     if (result) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Invalidar caché del usuario específico y del listado general
    await redis.del(`user:${id}`);
    await redis.del('users');

      res.status(200).json({ message: 'Usuario actualizado exitosamente' });
      
   } catch (error) {
      console.log(error)

      return  res.status(500).json({ message: error.message });

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

//-------------------------------------------------------------------------------

static login =async(req,res)=>{
   const {email,password}= req.body

   try {

      const user= await User.findByEmail(email)
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

   await User.insertLoginRecord(user.id,code)

   res.status(200).json({
      message:'inicio de sesion existoso',
      token:token,
   })
      
   } catch (error) {
      console.log(error)
      return res.status(500).json({message: error.message})
      
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
   const user= await User.getUserByCedula(cedula)
   if(!user){
      return res.status(404).json({ message: 'Usuario no encontrado' });
      
   }

   res.status(200).json(user)
   
  } catch (error) {
   console.log(error)
   return res.status(500).json({message: error.message})

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
         console.log(error)
         return res.status(500).json({message: error.message})

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
      console.log(error)
      return res.status(500).json({message: error.message})
      
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

     // Almacena los resultados en Redis por un tiempo determinado (ej. 1 hora)
     await redis.set(cacheKey, JSON.stringify(users), 'EX', 3600);

      res.status(200).json(users)

   }catch(error){
      console.log(error)
      return res.status(500).json({message: error.message})
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


                 // Subir la imagen a Supabase Storage
                 const imageFile = req.files[0]; // Asumiendo que estás subiendo una sola imagen por usuario
                 let imagePath = null;
     
                 if (imageFile) {
                  const { data, error: uploadError } = await supabase
                      .storage
                      .from('uploads') // Nombre del bucket
                      .upload(`uploads/${imageFile.originalname}`, imageFile.buffer, {
                          cacheControl: '3600',
                          upsert: false,
                      });
  
                  if (uploadError) {
                      console.error('Error al subir la imagen:', uploadError);
                      return res.status(500).json({ error: 'Error al subir la imagen' });
                  }
  
                  // Obtener la URL de la imagen subida
                  imagePath = data.Key; // o `data.path` dependiendo de cómo esté configurado tu bucket
              }

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
       console.error('Error ejecutando la consulta:', error);
       res.status(500).json({ error: 'Error interno del servidor' });
   }
}

//------------------------------------------------------------------------
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
      console.log(error)
      return res.status(500).json({message: error.message})
      
   }

 }


}


export default userController