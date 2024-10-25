import supabase from "../config/supabaseClient.js";


class  User {

    static getUsers= async ()=>{

        const  { data, error } = await supabase.from('usuarios').select('*');
        if(error) throw new Error(error.message);
        return data

}


}

export default User