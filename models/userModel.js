import supabase from "../config/supabaseClient.js";
import {hash,genSalt,compare} from 'bcrypt';
import { v4 as uuidv4, v4 } from 'uuid';


class  User {

    static getUsers= async ()=>{

        const  { data, error } = await supabase.from('usuarios').select('*')
        .order('id', { ascending: true });  // Ordenar por ID ascendente
        
        if(error) throw new Error(error.message);
        return data

}

//----------------------------------------------------------------------------------

static getUserById = async (id)=>{
    const { data, error } = await supabase.from('usuarios').select('*').eq('id',id).single()

    if(error) throw new Error (error.message);

    return data

}

//-------------------------------------------------------------------------------------------------

 static getUserByName = async  (name)=>{

    const  { data, error } = await supabase.from('usuarios').select('*').ilike('nombre', `%${name}%`); // Búsqueda flexible por nombre

  if(error) throw new Error(error.message);
return data


}
//-----------------------------------------------------------------------------------------------------

static getUserByCedula = async (cedula)=>{
    const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('cedula', cedula)

if (error && error.code !== 'PGRST116') {
    // Handle any error that is not "not found"
    throw new Error(error.message);
}

return data 

}

//----------------------------------------------------------------------------------------------------


static checkCedulaExists = async (cedula) => {
    const { data: existingCedula, error } = await supabase
        .from('usuarios')
        .select('cedula')
        .eq('cedula', cedula)
        .single(); // Use .single() to get a single record

    if (error && error.code !== 'PGRST116') {
        // Handle any error that is not "not found"
        throw new Error(error.message);
    }

    // If existingCedula is null, it means it does not exist
    return existingCedula !== null; // Return true if it exists, false otherwise
}



//-----------------------------------------------------------------------------------------------------


static addUser  =  async (nombre, apellido, cedula, email, password)=>{


  const {data,error}= await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message);
  }

  const uuid = data.user.id; // UUID del usuario creado en Supabase

  const salt=  await genSalt(10);

const hashedpassword= await  hash(password,salt)

    const { error: dbError } = await supabase.from('usuarios').insert([

    {
        uuid,
        nombre,
        apellido,
        cedula,
        email,
        contraseña:hashedpassword
    }
])
if (dbError) {
    throw new Error(dbError.message);
  }

    return data;

}



static deleteUser  = async (id) => {

    const  { data, error } = await supabase.from('usuarios').delete().eq('id', id).select()

    if(error) throw new  Error (error.message)

        return data;
}



static  updateUser = async (id, updateFields) => {
    const { data, error } = await supabase
    .from('usuarios')
    .update(updateFields)
    .eq('id', id)
    
    if(error) throw new Error (error.message)
        return data
    }

    //----------------------------------------------------------------------

    
    static loginSupabase = async (email,password)=>{
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if(error) throw new Error (error.message)


            return data
    }

  //------------------------------------------------------------------------------

   static  findByEmail= async(email)=>{
    const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)

    if(error) throw new Error (error.message)
        return data[0]

   }

   //-------------------------------------------------------------------------------------
   static insertLoginRecord=async (userId,code)=>{
    const fecha=  new Date()

    const  { data, error } = await supabase
    .from('historial_ingresos')
    .insert([
        { id_usuario: userId, fecha,codigo: code }
        ])
        if(error) throw new Error (error.message)
            return data



   }


   //--------------------------------------------------------------------------------------------

   static getLoginHistory= async  (userId)=>{
    const { data, error } = await supabase
    .from('historial_ingresos')
    .select('*')
    .eq('id_usuario', userId)
    if(error) throw new Error (error.message)
        return data


    
}

//----------------------------------------------------------------------------------------------

 static getUsersWithPagination= async (limit,offset)=>{
    const  { data, error,count } = await supabase
    .from('usuarios')
    .select('*',{count:'exact'})
    .order('id',{ascending: true})
    .range(offset,offset +limit-1)

    if(error) throw new Error (error.message)
        return data
    

 }


//-----------------------------------------------------------------------------------------------------

static  searchUsers = async (filters) => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('nombre,apellido,cedula,email')
    .match(filters)
    
    if(error) throw new Error (error.message)
        return data

    
    }

//------------------------------------------------------------

static addMultipleUsers= async (users)=>{
    const {data,error}= await supabase
    .from('usuarios')
    .insert(users)

    if (error) throw new Error('Error al insertar usuarios en Supabase: ' + error.message);

        return data;
    
}

 static changeStatus = async (status,id)=>{
   const {data,error}= await supabase
   .from('usuarios')
   .update({status})
   .eq('id',id)
   if(error){
    console.error('Error updating status:', error);
    return null; // O lanza un error si prefieres
   }
   return data
 }

 
static getUserStatus=async(id)=> {
    const { data, error } = await supabase
        .from('usuarios')
        .select('status')
        .eq('id', id)
        .single(); // .single() para obtener un solo registro

    if (error) {
        console.error('Error fetching user status:', error);
        return null; // O maneja el error de la manera que prefieras
    }

    return data; // Devuelve el objeto que contiene el estatus
}

}



export default User