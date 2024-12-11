import supabase from "../config/supabaseClient.js";


class RolesPermisos {

static getRoles = async ()=>{
   
        const { data, error } = await supabase
            .from('roles')
            .select('rol');
        if (error) throw new Error(error.message);
        return data;

}

static getRoleById = async (id)=>{
    const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id_rol', id)
    .single();
if (error) throw new Error(error.message);
return data;


}
static getRoleByName = async (name)=> {
    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('rol', name)
        .single();
    if (error) throw new Error(error.message);
    return data;
}

}
export default RolesPermisos