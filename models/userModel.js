import supabase from "../config/supabaseClient.js";


class  User {

    static getUsers= async ()=>{

        const  { data, error } = await supabase.from('usuarios').select('*');
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


static addUser  =  async (nombre, apellido, cedula, correo, hashedPassword)=>{
const { data, error } = await supabase.from('usuarios').insert([

    {nombre,apellido,cedula,correo,contraseña:hashedPassword}
])
.select()

if(error) throw new Error (error.message)
    return data[0];

}



static deleteUser  = async (id) => {

    const  { data, error } = await supabase.from('usuarios').delete().eq('id', id).select()

    if(error) throw new  Error (error.message)

        return data;
}

    
}




export default User