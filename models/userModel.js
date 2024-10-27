import supabase from "../config/supabaseClient.js";
import {hash,genSalt,compare} from 'bcrypt';


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

static getUserByCedula = async (req,res)=>{
    const {data,error}=await supabase.from('usuarios').select('*').eq('cedula')
    if (error) throw new Error(error.message);
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
    
}






export default User